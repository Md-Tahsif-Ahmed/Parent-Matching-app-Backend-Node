import { Types } from "mongoose";
import { BlockModel } from "../block/block.model";
import { LikeModel } from "../match/like.model";
import { ConversationModel } from "../conversation/conversation.model";
import { Profile } from "../profile/profile.model";

type ObjId = Types.ObjectId | string;

export const FeedService = {
  async list(me: ObjId, limit = 20) {
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
      LikeModel.distinct("to", { from: me, type: "PASS", expiresAt: { $gt: new Date() } }),
      LikeModel.distinct("to", { from: me, type: "LIKE" }),

      // NOTE: therapy + completion যোগ করা হলো
      Profile.findOne({ user: me }).select({
        location: 1,
        interests: 1,
        values: 1,
        diagnosis: 1,
        therapy: 1,
        journeyName: 1,
        childAge: 1,
        completion: 1,
      }),
    ]);

    const blocked   = Array.from(new Set([...blockedByMe, ...blockedMe].map(String)));
    const engaged   = (engagedAgg[0]?.ids || []).map(String);
    const cooling   = coolingRaw.map(String);
    const likedOut  = likedOutRaw.map(String);

    const meId = new Types.ObjectId(String(me));
    const banIds = [...blocked, ...engaged, ...cooling, ...likedOut].map(id => new Types.ObjectId(id));

    // my profile constants (lowercased for set ops)
    const myInterestsLower = (myProf?.interests || []).map(s => s.toLowerCase());
    const myValuesLower    = (myProf?.values    || []).map(s => s.toLowerCase());
    const myTherapyLower   = myProf?.therapy?.name ? String(myProf.therapy.name).toLowerCase() : null;
    const myJourneyName    = myProf?.journeyName ?? null;
    const myDiagName       = myProf?.diagnosis?.name ?? null;
    const myChildAge       = typeof myProf?.childAge === "number" ? myProf!.childAge : null;
    const myComplNorm      = typeof myProf?.completion === "number" ? (myProf!.completion / 100) : 0;

    // geo available?
    const coordsOk =
      Array.isArray(myProf?.location?.coordinates) &&
      myProf!.location!.coordinates.length === 2 &&
      myProf!.location!.coordinates.every(n => typeof n === "number" && !isNaN(n));
    const myHasGeo = !!coordsOk;

    const pipeline: any[] = [];

    // --- GEO / base filter first stage ---
    if (myHasGeo) {
      pipeline.push({
        $geoNear: {
          key: "location",
          spherical: true,
          near: { type: "Point", coordinates: myProf!.location!.coordinates },
          distanceField: "distance",               // meters
          maxDistance: 100 * 1000,                 // 100 km
          query: {
            user: { $ne: meId, $nin: banIds },
            consentAt: { $ne: null },
            completion: { $gte: 40 },
          },
        },
      });
    } else {
      pipeline.push({
        $match: {
          user: { $ne: meId, $nin: banIds },
          consentAt: { $ne: null },
          completion: { $gte: 40 },
        },
      });
    }

    // --- Stage A: normalize fields for scoring ---
    pipeline.push({
      $addFields: {
        // candidate completion normalized
        complNorm: { $divide: ["$completion", 100] },

        // lowercase arrays for case-insensitive set ops
        interestsLower: {
          $map: { input: { $ifNull: ["$interests", []] }, as: "x", in: { $toLower: "$$x" } }
        },
        valuesLower: {
          $map: { input: { $ifNull: ["$values", []] }, as: "x", in: { $toLower: "$$x" } }
        },
    
        therapyNameLower: { $toLower: { $ifNull: ["$therapy.name", ""] } },
      },
    });

    // --- Stage B: compute scores (Jaccard + exact matches + completion similarity) ---
    pipeline.push({
      $addFields: {
        // Jaccard similarity for interests
        interestScore: {
          $let: {
            vars: {
              interSize: {
                $size: { $setIntersection: ["$interestsLower", myInterestsLower] }
              },
              unionSize: {
                $size: { $setUnion: ["$interestsLower", myInterestsLower] }
              }
            },
            in: {
              $cond: [{ $gt: ["$$unionSize", 0] }, { $divide: ["$$interSize", "$$unionSize"] }, 0]
            }
          }
        },

        // Jaccard similarity for values
        valueScore: {
          $let: {
            vars: {
              interSize: {
                $size: { $setIntersection: ["$valuesLower", myValuesLower] }
              },
              unionSize: {
                $size: { $setUnion: ["$valuesLower", myValuesLower] }
              }
            },
            in: {
              $cond: [{ $gt: ["$$unionSize", 0] }, { $divide: ["$$interSize", "$$unionSize"] }, 0]
            }
          }
        },

        // journey / diagnosis exact match (only if mine present)
        journeyScore: myJourneyName
          ? { $cond: [{ $eq: ["$journeyName", myJourneyName] }, 1, 0] }
          : 0,
        diagScore: myDiagName
          ? { $cond: [{ $eq: ["$diagnosis.name", myDiagName] }, 1, 0] }
          : 0,

        // therapy exact match (supports both single 'therapy')
         therapyScore: myTherapyLower
      ? { $cond: [{ $eq: ["$therapyNameLower", myTherapyLower] }, 1, 0] }
      : 0,

        // childAge proximity: within 6 months (only if my age present)
        ageScore: myChildAge !== null
          ? {
              $cond: [
                {
                  $lte: [
                    { $abs: { $subtract: [ { $ifNull: ["$childAge", 9999] }, myChildAge ] } },
                    6
                  ]
                },
                1, 0
              ]
            }
          : 0,

        // completion similarity to me (0..1): closer => higher
        complAffinity: {
          $subtract: [1, { $abs: { $subtract: ["$complNorm", myComplNorm] } }]
        },
      },
    });

    // --- geo normalization ---
    if (myHasGeo) {
      pipeline.push({ $addFields: { distanceKm: { $divide: ["$distance", 1000] } } });
      pipeline.push({
        $addFields: {
          geoScore: {
            $subtract: [1, { $min: [1, { $divide: [{ $ifNull: ["$distanceKm", 100] }, 100] }] }]
          }
        }
      });
    }

    // --- final weighted score ---
    pipeline.push({
      $addFields: {
        score: {
          $add: [
            // keep raw completeness so fully-filled profiles are preferred a bit
            "$complNorm",

            // similarity features
            { $multiply: [0.25, "$interestScore"] },
            { $multiply: [0.15, "$valueScore"] },
            { $multiply: [0.20, "$journeyScore"] },
            { $multiply: [0.20, "$diagScore"] },
            { $multiply: [0.10, "$ageScore"] },
            { $multiply: [0.15, "$therapyScore"] },
            { $multiply: [0.10, "$complAffinity"] },

            // geo
            myHasGeo ? { $multiply: [0.20, "$geoScore"] } : 0
          ]
        }
      }
    });

    pipeline.push({ $sort: { score: -1, _id: -1 } });
    pipeline.push({ $limit: Math.max(1, Math.min(100, Number(limit) || 20)) });

    return await Profile.aggregate(pipeline);
  },
};
