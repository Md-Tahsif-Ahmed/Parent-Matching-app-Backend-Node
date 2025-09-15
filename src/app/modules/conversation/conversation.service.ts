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

  async matchList(me: ObjId) {
    return await ConversationModel.find({
      "participants.user": me,
      "participants.state": { $in: ["ACTIVE","PENDING"] },
    }).sort({ updatedAt: -1 });
  },

  async myActiveList(me: ObjId) {
  return await ConversationModel.find({
    participants: {
      $elemMatch: {
        user: me,
        state: "ACTIVE"  // Only include conversations where the user is ACTIVE
      }
    }
  }).sort({ updatedAt: -1 });
},

  async recentMatches(me: ObjId) {
    return await ConversationModel.find({ "participants.user": me })
      .sort({ createdAt: -1 })
      .limit(50);
  },


  //  my archived list (for cleanup)

   // ...other methods,

  /**
   * Archived list (আমি আছি + কনভারসেশনে ARCHIVED আছে)
   * partner এর name, profilePicture (Profile থেকে) জুড়ে দেয়
   * যদি Profile.name না থাকে, fallback = User.name
   */
  async archivedListWithProfiles(me: ObjId) {
    const meId = new Types.ObjectId(String(me));

    const items = await ConversationModel.aggregate([
      {
        $match: {
          "participants.user": meId,         // আমি participant
          "participants.state": "ARCHIVED",  // কারো state ARCHIVED হলেই মিলবে
        },
      },
      // partner element বের করা (আমি বাদে যে user)
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
      // partner.user -> Profile lookup
      {
        $lookup: {
          from: "profiles",                // ⚠️ collection name নিশ্চিত করো
          localField: "partner.user",
          foreignField: "user",
          as: "partnerProfile",
          pipeline: [
            { $project: { _id: 1, user: 1, name: 1, profilePicture: 1 } } // name থাকলে নেবে
          ],
        },
      },
      { $unwind: { path: "$partnerProfile", preserveNullAndEmptyArrays: true } },

      // fallback: profile.name না থাকলে User.name আনো
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

      // name = profile.name ?? user.name
    {
  $addFields: {
    partnerName: { $ifNull: ["$partnerProfile.name", "$partnerUser.name"] },
    partnerAvatarUrl: "$partnerProfile.profilePicture.url",
    isArchived: true,
    canSend: false
  }
},

{
  $project: {
    _id: 1,
    pairKey: 1,
    lastMessageAt: 1,
    createdAt: 1,
    updatedAt: 1,
    partner: {
      _id: "$partner.user",
      state: "$partner.state",
      name: "$partnerName",
      avatar: "$partnerAvatarUrl",
    },
    isArchived: 1,
    canSend: 1
  }
},
 
      
      { $sort: { updatedAt: -1 } },
    ]);

    // // stringify ids for FE
    // return items.map((x: any) => ({
    //   ...x,
    //   _id: String(x._id),
    //   partner: x.partner
    //     ? { ...x.partner, _id: String(x.partner._id) }
    //     : null,
    // }));
  },


};
