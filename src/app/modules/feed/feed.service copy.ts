import { Types } from "mongoose";
import { BlockModel } from "../block/block.model";
import { LikeModel } from "../match/like.model";
import { ConversationModel } from "../conversation/conversation.model";
import { Profile } from "../profile/profile.model"; // adjust path if needed

type ObjId = Types.ObjectId | string;

export const FeedService = {
  async list(me: ObjId, limit = 20) {
    // ---- pre-queries in parallel (faster) ----
    const [
      blockedByMe,
      blockedMe,
      engagedAgg,
      coolingRaw,
      likedOutRaw,
      myProf,
    ] = await Promise.all([
      BlockModel.distinct("user", { by: me }),
      BlockModel.distinct("by", { user: me }),
      ConversationModel.aggregate([
        { $match: { "participants.user": new Types.ObjectId(String(me)) } },
        { $unwind: "$participants" },
        { $match: { "participants.user": { $ne: new Types.ObjectId(String(me)) } } },
        { $group: { _id: null, ids: { $addToSet: "$participants.user" } } },
      ]),
      LikeModel.distinct("to", {
        from: me,
        type: "PASS",
        expiresAt: { $gt: new Date() },
      }),
      LikeModel.distinct("to", { from: me, type: "LIKE" }),


      Profile.findOne({ user: me }).select({
        location: 1,
        interests: 1,
        values: 1,
        diagnosis: 1,
        journeyName: 1,
        childAge: 1,
      }),
    ]);

    const blocked = Array.from(new Set([...blockedByMe, ...blockedMe].map(String)));
    const engaged = (engagedAgg[0]?.ids || []).map(String);
    const cooling = coolingRaw.map(String);
    const likedOut = likedOutRaw.map(String);

    const myHasGeo   = !!myProf?.location;
    const hasJourney = !!myProf?.journeyName;
    const hasDiag    = !!myProf?.diagnosis?.name;
    const hasAge     = typeof myProf?.childAge === "number";

    // ---- pipeline ----
    const pipeline: any[] = [];

    // If geo available, start with $geoNear
    if (myHasGeo) {
      pipeline.push({
        $geoNear: {
          key: "location",
          spherical: true,
          near: { type: "Point", coordinates: myProf!.location!.coordinates },
          distanceField: "distance",   // meters
          maxDistance: 100 * 1000,     // 100 km in meters
        },
      });
    } else {
      pipeline.push({ $match: { _id: { $exists: true } } });
    }

    pipeline.push({
      $match: {
        user: {
          $ne: new Types.ObjectId(String(me)),
          $nin: [...blocked, ...engaged, ...cooling, ...likedOut].map((id) => new Types.ObjectId(id)),
        },
        consentAt: { $ne: null },
        completion: { $gte: 40 },
      },
    });

    // base scores + safe conditionals
    pipeline.push({
      $addFields: {
        complNorm: { $divide: ["$completion", 100] },

        interestScore: {
          $cond: [{ $gt: [{ $size: { $ifNull: ["$interests", []] } }, 0] }, 1, 0],
        },
        valueScore: {
          $cond: [{ $gt: [{ $size: { $ifNull: ["$values", []] } }, 0] }, 1, 0],
        },

        // only if my profile has journeyName
        journeyScore: hasJourney
          ? { $cond: [{ $eq: ["$journeyName", myProf!.journeyName] }, 1, 0] }
          : 0,

        // only if my profile has diagnosis.name
        diagScore: hasDiag
          ? { $cond: [{ $eq: ["$diagnosis.name", myProf!.diagnosis!.name] }, 1, 0] }
          : 0,

        // within 6 months only if I have childAge; candidate.childAge null-safe (defaults far away)
        ageScore: hasAge
          ? {
              $cond: [
                {
                  $lte: [
                    { $abs: { $subtract: [ { $ifNull: ["$childAge", 9999] }, myProf!.childAge ] } },
                    6,
                  ],
                },
                1,
                0,
              ],
            }
          : 0,
      },
    });

    // geo normalization (only if geo is present)
    if (myHasGeo) {
      pipeline.push({
        $addFields: {
          distanceKm: { $divide: ["$distance", 1000] },
        },
      });
      pipeline.push({
        $addFields: {
          // 0km -> ~1, 100km+ -> ~0
          geoScore: {
            $subtract: [
              1,
              {
                $min: [
                    1,
                    {
                      $divide: [
                        { $ifNull: ["$distanceKm", 100] },
                        100,
                      ],
                    },
                ],
              },
            ],
          },
        },
      });
    }

    // Final score (uses geoScore only when myHasGeo)
    pipeline.push({
      $addFields: {
        score: {
          $add: [
            "$complNorm",
            { $multiply: [0.25, "$interestScore"] },
            { $multiply: [0.15, "$valueScore"] },
            { $multiply: [0.20, "$journeyScore"] },
            { $multiply: [0.20, "$diagScore"] },
            { $multiply: [0.10, "$ageScore"] },
            myHasGeo ? { $multiply: [0.20, "$geoScore"] } : 0,
          ],
        },
      },
    });

    pipeline.push({ $sort: { score: -1, _id: -1 } });
    pipeline.push({ $limit: limit });

    // Optional: minimize payload (uncomment if needed)
    /*
    pipeline.push({
      $project: {
        user: 1, aboutMe: 1, profilePicture: 1, galleryPhotos: 1,
        locationText: 1, journeyName: 1, diagnosis: 1, childAge: 1,
        interests: 1, values: 1,
        score: 1, distanceKm: 1,
      }
    });
    */

    return await Profile.aggregate(pipeline);
  },
};
