import { Types } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { ConversationModel } from "./conversation.model";
import { NoShowPairModel } from "../match/noShowPair.model";
import { emitToUser } from "../../../helpers/realtime";

type ObjId = Types.ObjectId | string;

export const ConversationService = {
  async archive(me: ObjId, convId: string) {
    const conv = await ConversationModel.findById(convId);
    if (!conv)
      throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");

    const mePart = conv.participants.find((p) => String(p.user) === String(me));
    if (!mePart) throw new ApiError(StatusCodes.FORBIDDEN, "Not a participant");

    // both sides ARCHIVED
    conv.participants.forEach((p) => (p.state = "ARCHIVED"));
    await conv.save();

    // permanent no-show edges (both directions)
    try {
      const a = conv.participants[0]?.user;
      const b = conv.participants[1]?.user;
      if (a && b) {
        await NoShowPairModel.insertMany(
          [
            { a, b, reason: "ARCHIVED", at: new Date() },
            { a: b, b: a, reason: "ARCHIVED", at: new Date() },
          ],
          { ordered: false }
        );
      }
    } catch {}

    // realtime update
    // try {
    //   for (const p of conv.participants) {
    //     emitToUser(String(p.user), "chat:archived", { convId: String(conv._id) });
    //   }
    // } catch {}

    return conv;
  },

  async matchList(
    me: ObjId,
    query: { page?: number; limit?: number; searchTerm?: string }
  ) {
    const meId = new Types.ObjectId(String(me));
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm?.trim();

    const [result] = await ConversationModel.aggregate([
      // only conversations where your state is ACTIVE or PENDING
      {
        $match: {
          participants: {
            $elemMatch: { user: meId, state: { $in: ["ACTIVE", "PENDING"] } },
          },
        },
      },
      // pick the partner participant
      {
        $addFields: {
          partner: {
            $first: {
              $filter: {
                input: "$participants",
                as: "p",
                cond: { $ne: ["$$p.user", meId] },
              },
            },
          },
        },
      },
      // FULL partner profile
      {
        $lookup: {
          from: "profiles",
          localField: "partner.user",
          foreignField: "user",
          as: "profile",
        },
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },

      // Search on partner name (profile.name)
      ...(searchTerm
        ? [
            {
              $match: {
                "profile.name": { $regex: searchTerm, $options: "i" },
              },
            },
          ]
        : []),

      // Wrap in facet for pagination + totalCount
      {
        $facet: {
          list: [
            {
              $project: {
                _id: 1,
                pairKey: 1,
                createdAt: 1,
                updatedAt: 1,
                profile: 1,
              },
            },
            { $sort: { updatedAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $project: {
          list: 1,
          totalCount: {
            $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
          },
          totalPages: {
            $ceil: {
              $divide: [
                { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
                limit,
              ],
            },
          },
          currentPage: { $literal: page },
          limit: { $literal: limit },
        },
      },
    ]);

    return result;
  },

  // --- MY ACTIVE LIST (same aggregation as archive but state=ACTIVE) ---
  async myActiveList(
    me: ObjId,
    query: { page?: number; limit?: number; searchTerm?: string }
  ) {
    const meId = new Types.ObjectId(String(me));
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm?.trim();

    // Aggregate pipeline
    const [result] = await ConversationModel.aggregate([
      {
        $match: {
          participants: { $elemMatch: { user: meId, state: "ACTIVE" } },
        },
      },
      {
        $addFields: {
          mePart: {
            $first: {
              $filter: {
                input: "$participants",
                as: "p",
                cond: { $eq: ["$$p.user", meId] },
              },
            },
          },
          partner: {
            $first: {
              $filter: {
                input: "$participants",
                as: "p",
                cond: { $ne: ["$$p.user", meId] },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "partner.user",
          foreignField: "user",
          as: "partnerProfile",
          pipeline: [
            { $project: { _id: 1, user: 1, name: 1, profilePicture: 1 } },
          ],
        },
      },
      {
        $unwind: { path: "$partnerProfile", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "partner.user",
          foreignField: "_id",
          as: "partnerUser",
          pipeline: [{ $project: { _id: 1, name: 1 } }],
        },
      },
      { $unwind: { path: "$partnerUser", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          partnerName: {
            $ifNull: ["$partnerProfile.name", "$partnerUser.name"],
          },
          partnerAvatarUrl: "$partnerProfile.profilePicture.url",
        },
      },
      {
        $lookup: {
          from: "messages",
          let: { convId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$conv", "$$convId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 1,
                text: 1,
                files: 1,
                type: 1,
                sender: 1,
                createdAt: 1,
                deliveredAt: 1,
                seenAt: 1,
              },
            },
          ],
          as: "lastMessage",
        },
      },
      { $addFields: { lastMessage: { $first: "$lastMessage" } } },

      //  Search by partner name or last message
      ...(searchTerm
        ? [
            {
              $match: {
                $or: [
                  { partnerName: { $regex: searchTerm, $options: "i" } },
                  // { "lastMessage.text": { $regex: searchTerm, $options: "i" } },
                ],
              },
            },
          ]
        : []),

      // Wrap in facet for pagination + totalCount
      {
        $facet: {
          list: [
            {
              $project: {
                _id: 1,
                pairKey: 1,
                lastMessage: 1,
                createdAt: 1,
                updatedAt: 1,
                partner: {
                  _id: "$partner.user",
                  state: "$partner.state",
                  name: "$partnerName",
                  avatar: "$partnerAvatarUrl",
                },
                isArchived: { $literal: false },
                canSend: { $eq: ["$mePart.state", "ACTIVE"] },
              },
            },
            { $sort: { updatedAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $project: {
          list: 1,
          totalCount: {
            $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
          },
          totalPages: {
            $ceil: {
              $divide: [
                { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
                limit,
              ],
            },
          },
          currentPage: { $literal: page },
          limit: { $literal: limit },
        },
      },
    ]);

    return result;
  },

  //  my archived list

  // --- ARCHIVED LIST (with last message + deliveredAt) ---
  async archivedListWithProfiles(
    me: ObjId,
    query: { page?: number; limit?: number; searchTerm?: string }
  ) {
    const meId = new Types.ObjectId(String(me));
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm?.trim();

    const [result] = await ConversationModel.aggregate([
      // only convos where *my* state is ARCHIVED
      {
        $match: {
          participants: { $elemMatch: { user: meId, state: "ARCHIVED" } },
        },
      },

      // add mePart & partner
      {
        $addFields: {
          mePart: {
            $first: {
              $filter: {
                input: "$participants",
                as: "p",
                cond: { $eq: ["$$p.user", meId] },
              },
            },
          },
          partner: {
            $first: {
              $filter: {
                input: "$participants",
                as: "p",
                cond: { $ne: ["$$p.user", meId] },
              },
            },
          },
        },
      },

      // join profiles
      {
        $lookup: {
          from: "profiles",
          localField: "partner.user",
          foreignField: "user",
          as: "partnerProfile",
          pipeline: [
            { $project: { _id: 1, user: 1, name: 1, profilePicture: 1 } },
          ],
        },
      },
      {
        $unwind: { path: "$partnerProfile", preserveNullAndEmptyArrays: true },
      },

      // join users
      {
        $lookup: {
          from: "users",
          localField: "partner.user",
          foreignField: "_id",
          as: "partnerUser",
          pipeline: [{ $project: { _id: 1, name: 1 } }],
        },
      },
      { $unwind: { path: "$partnerUser", preserveNullAndEmptyArrays: true } },

      // compute partnerName
      {
        $addFields: {
          partnerName: {
            $ifNull: ["$partnerProfile.name", "$partnerUser.name"],
          },
          partnerAvatarUrl: "$partnerProfile.profilePicture.url",
        },
      },

      //  search on partnerName
      ...(searchTerm
        ? [
            {
              $match: {
                // participants: { $elemMatch: { user: meId, state: "ARCHIVED" } },
                partnerName: { $regex: searchTerm, $options: "i" },
              },
            },
          ]
        : []),

      // last message
      {
        $lookup: {
          from: "messages",
          let: { convId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$conv", "$$convId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 1,
                text: 1,
                files: 1,
                type: 1,
                sender: 1,
                createdAt: 1,
                deliveredAt: 1,
                seenAt: 1,
              },
            },
          ],
          as: "lastMessage",
        },
      },
      { $addFields: { lastMessage: { $first: "$lastMessage" } } },

      // facet for pagination
      {
        $facet: {
          list: [
            {
              $project: {
                _id: 1,
                pairKey: 1,
                lastMessage: 1,
                createdAt: 1,
                updatedAt: 1,
                partner: {
                  _id: "$partner.user",
                  state: "$partner.state",
                  name: "$partnerName",
                  avatar: "$partnerAvatarUrl",
                },
                isArchived: { $eq: ["$mePart.state", "ARCHIVED"] },
                canSend: { $literal: false },
              },
            },
            { $sort: { updatedAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $project: {
          list: 1,
          totalCount: {
            $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
          },
          totalPages: {
            $ceil: {
              $divide: [
                { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
                limit,
              ],
            },
          },
          currentPage: { $literal: page },
          limit: { $literal: limit },
        },
      },
    ]);

    return result;
  },

  // --- RECENT MATCHES (just convId + partner profilePicture) ---
  async recentMatches(me: ObjId) {
    const meId = new Types.ObjectId(String(me));

    return await ConversationModel.aggregate([
      // I am a participant
      { $match: { "participants.user": meId } },

      // pick the partner participant (the one that's not me)
      {
        $addFields: {
          partner: {
            $first: {
              $filter: {
                input: "$participants",
                as: "p",
                cond: { $ne: ["$$p.user", meId] },
              },
            },
          },
        },
      },

      // join partner -> profiles to get profilePicture
      {
        $lookup: {
          from: "profiles",
          localField: "partner.user",
          foreignField: "user",
          as: "partnerProfile",
          pipeline: [{ $project: { _id: 1, user: 1, profilePicture: 1 } }],
        },
      },
      {
        $unwind: { path: "$partnerProfile", preserveNullAndEmptyArrays: true },
      },

      // final shape (includes the raw object + a ready URL if present)
      {
        $project: {
          _id: 1,
          pairKey: 1,
          createdAt: 1,
          updatedAt: 1,
          partner: {
            _id: "$partner.user",
            // profilePicture: "$partnerProfile.profilePicture",
            avatar: "$partnerProfile.profilePicture.url",
          },
        },
      },

      { $sort: { createdAt: -1 } },
      { $limit: 50 },
    ]);
  },
};
