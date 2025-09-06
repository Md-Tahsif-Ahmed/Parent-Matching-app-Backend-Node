import { Types } from "mongoose";
import { BlockModel } from "../block/block.model";
import { LikeModel } from "../match/like.model";
import { ConversationModel } from "../conversation/conversation.model";
import { Profile } from "../profile/profile.model";
import { NoShowPairModel } from "../match/noShowPair.model";

type ObjId = Types.ObjectId | string;

export const FeedService = {
  /**
   * Feed builder with:
   * - Journey preference boost (non-exact)
   * - Archive/Block safety-net via NoShowPairModel (both directions no-show)
   * - Like behavior: people I liked are excluded; people who liked me get a soft boost
   * - Completion band filter: ±10% around my completion (clamped 1..100)
   * - Diagnosis/Therapy: name match + (additional) typeName match support
   */
  async list(me: ObjId, limit = 20) {
    const meId = new Types.ObjectId(String(me));

    const [
      blockedByMe,
      blockedMe,
      engagedAgg,
      coolingRaw,
      likedOutRaw,
      likedMeRaw,
      noShowA,
      noShowB,
      myProf,
    ] = await Promise.all([
      BlockModel.distinct("user", { by: meId }),
      BlockModel.distinct("by", { user: meId }),

      // anyone I've ever had a conversation with (any state)
      ConversationModel.aggregate([
        { $match: { "participants.user": meId } },
        { $unwind: "$participants" },
        { $match: { "participants.user": { $ne: meId } } },
        { $group: { _id: null, ids: { $addToSet: "$participants.user" } } },
      ]),

      // PASS cooling (still active)
      LikeModel.distinct("to", {
        from: meId,
        type: "PASS",
        expiresAt: { $gt: new Date() },
      }),
      // whom I LIKED -> exclude from my feed
      LikeModel.distinct("to", { from: meId, type: "LIKE" }),

      // who LIKED ME -> soft prioritize them in my feed
      LikeModel.distinct("from", { to: meId, type: "LIKE" }),

      // permanent no-show (safety-net, both directions)
      NoShowPairModel.distinct("b", { a: meId }),
      NoShowPairModel.distinct("a", { b: meId }),

      // my profile (for scoring context)
      Profile.findOne({ user: meId }).select({
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

    const blocked = Array.from(
      new Set([...blockedByMe, ...blockedMe].map(String))
    );
    const engaged = (engagedAgg[0]?.ids || []).map(String);
    const cooling = coolingRaw.map(String);
    const likedOut = likedOutRaw.map(String);
    const noShowAB = Array.from(new Set([...noShowA, ...noShowB].map(String)));

    // ---- BAN LIST (never show) ----
    const banIds = [
      meId,
      ...blocked,
      ...engaged,
      ...cooling,
      ...likedOut,
      ...noShowAB,
    ].map((id) => new Types.ObjectId(String(id)));

    // ---- inbound LIKE set (for a soft boost) ----
    const likedMeIds = likedMeRaw.map(
      (id: any) => new Types.ObjectId(String(id))
    );

    // my profile constants
    const myInterestsLower = (myProf?.interests || []).map((s: string) =>
      s.toLowerCase()
    );
    const myValuesLower = (myProf?.values || []).map((s: string) =>
      s.toLowerCase()
    );

    const myTherapyLower = myProf?.therapy?.name
      ? String(myProf.therapy.name).toLowerCase()
      : null;
    const myTherapyTypeLower = (myProf as any)?.therapy?.typeName
      ? String((myProf as any).therapy.typeName).toLowerCase()
      : (myProf as any)?.therapy?.type
      ? String((myProf as any).therapy.type).toLowerCase()
      : null;

    const myJourneyName = myProf?.journeyName ?? null;

    const myDiagName = myProf?.diagnosis?.name
      ? String(myProf.diagnosis.name)
      : null;
    const myDiagTypeLower = (myProf as any)?.diagnosis?.typeName
      ? String((myProf as any).diagnosis.typeName).toLowerCase()
      : (myProf as any)?.diagnosis?.type
      ? String((myProf as any).diagnosis.type).toLowerCase()
      : null;

    const myChildAge =
      typeof myProf?.childAge === "number" ? myProf!.childAge : null;
    const myComplPct = Math.round(
      typeof myProf?.completion === "number" ? myProf!.completion : 0
    ); // 0..100
    const myComplNorm = myComplPct / 100;

    // ---- Completion band (±10%) with clamp 1..100 ----
    const bandMinRaw = myComplPct - 10;
    const bandMaxRaw = myComplPct + 10;
    const bandMin = Math.max(1, bandMinRaw);
    const bandMax = Math.min(100, bandMaxRaw);
    const compFilter: any = { $gte: bandMin, $lte: bandMax };

    // --- Journey preference map (non-exact boosts) ---
    const journeyPrefMap: Record<string, string[]> = {
      "Just Starting": ["Managing Day-to-Day", "Mentor-Ready"],
      "Managing Day-to-Day": ["Mentor-Ready"],
      "Mentor-Ready": ["Managing Day-to-Day"],
    };
    const prefTargets = myJourneyName
      ? journeyPrefMap[myJourneyName] ?? []
      : [];

    // geo available?
    const coordsOk =
      Array.isArray(myProf?.location?.coordinates) &&
      (myProf!.location!.coordinates as any[]).length === 2 &&
      (myProf!.location!.coordinates as any[]).every(
        (n: any) => typeof n === "number" && !isNaN(n)
      );
    const myHasGeo = !!coordsOk;

    const pipeline: any[] = [];

    // --- GEO / base filter first stage ---
    if (myHasGeo) {
      pipeline.push({
        $geoNear: {
          key: "location",
          spherical: true,
          near: {
            type: "Point",
            coordinates: myProf!.location!.coordinates as number[],
          },
          distanceField: "distance", // meters
          maxDistance: 100 * 1000, // 100 km (tune from config if needed)
          query: {
            user: { $ne: meId, $nin: banIds },
            consentAt: { $ne: null },
            completion: compFilter,
          },
        },
      });
    } else {
      pipeline.push({
        $match: {
          user: { $nin: banIds },
          consentAt: { $ne: null },
          completion: compFilter,
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
          $map: {
            input: { $ifNull: ["$interests", []] },
            as: "x",
            in: { $toLower: "$$x" },
          },
        },
        valuesLower: {
          $map: {
            input: { $ifNull: ["$values", []] },
            as: "x",
            in: { $toLower: "$$x" },
          },
        },

        therapyNameLower: { $toLower: { $ifNull: ["$therapy.name", ""] } },
        therapyTypeLower: {
          $toLower: {
            $ifNull: ["$therapy.typeName", { $ifNull: ["$therapy.type", ""] }],
          },
        },

        diagnosisName: { $ifNull: ["$diagnosis.name", ""] },
        diagnosisTypeLower: {
          $toLower: {
            $ifNull: [
              "$diagnosis.typeName",
              { $ifNull: ["$diagnosis.type", ""] },
            ],
          },
        },

        // NEW: journey preference target(s) + inbound-like boost
        _prefTargets: prefTargets,
        _likedMeIds: likedMeIds,
      },
    });

    // --- Stage B: compute scores ---
    pipeline.push({
      $addFields: {
        // Jaccard similarity for interests
        interestScore: {
          $let: {
            vars: {
              interSize: {
                $size: {
                  $setIntersection: ["$interestsLower", myInterestsLower],
                },
              },
              unionSize: {
                $size: { $setUnion: ["$interestsLower", myInterestsLower] },
              },
            },
            in: {
              $cond: [
                { $gt: ["$$unionSize", 0] },
                { $divide: ["$$interSize", "$$unionSize"] },
                0,
              ],
            },
          },
        },

        // Jaccard similarity for values
        valueScore: {
          $let: {
            vars: {
              interSize: {
                $size: { $setIntersection: ["$valuesLower", myValuesLower] },
              },
              unionSize: {
                $size: { $setUnion: ["$valuesLower", myValuesLower] },
              },
            },
            in: {
              $cond: [
                { $gt: ["$$unionSize", 0] },
                { $divide: ["$$interSize", "$$unionSize"] },
                0,
              ],
            },
          },
        },

        // journey / diagnosis exact name match (only if mine present)
        journeyScore: myJourneyName
          ? { $cond: [{ $eq: ["$journeyName", myJourneyName] }, 1, 0] }
          : 0,
        diagScore: myDiagName
          ? { $cond: [{ $eq: ["$diagnosisName", myDiagName] }, 1, 0] }
          : 0,

        // therapy exact name match (single 'therapy' object assumed)
        therapyScore: myTherapyLower
          ? { $cond: [{ $eq: ["$therapyNameLower", myTherapyLower] }, 1, 0] }
          : 0,

        // NEW: typeName/type matching (lower weight; works even if name doesn't match)
        diagTypeScore: myDiagTypeLower
          ? { $cond: [{ $eq: ["$diagnosisTypeLower", myDiagTypeLower] }, 1, 0] }
          : 0,
        therapyTypeScore: myTherapyTypeLower
          ? {
              $cond: [{ $eq: ["$therapyTypeLower", myTherapyTypeLower] }, 1, 0],
            }
          : 0,

        // childAge proximity: within 6 months (only if my age present)
        ageScore:
          myChildAge !== null
            ? {
                $cond: [
                  {
                    $lte: [
                      {
                        $abs: {
                          $subtract: [
                            { $ifNull: ["$childAge", 9999] },
                            myChildAge,
                          ],
                        },
                      },
                      6,
                    ],
                  },
                  1,
                  0,
                ],
              }
            : 0,

        // completion similarity to me (0..1): closer => higher
        complAffinity: {
          $subtract: [1, { $abs: { $subtract: ["$complNorm", myComplNorm] } }],
        },

        // NEW: Journey-bias preference (non-exact, separate from exact match)
        journeyAffinity: {
          $cond: [{ $in: ["$journeyName", "$_prefTargets"] }, 1, 0],
        },

        // NEW: Inbound LIKE soft boost (if candidate liked me)
        inboundLiked: {
          $cond: [{ $in: ["$user", "$_likedMeIds"] }, 1, 0],
        },
      },
    });

    // --- geo normalization ---
    if (myHasGeo) {
      pipeline.push({
        $addFields: { distanceKm: { $divide: ["$distance", 1000] } },
      });
      pipeline.push({
        $addFields: {
          geoScore: {
            $subtract: [
              1,
              {
                $min: [
                  1,
                  { $divide: [{ $ifNull: ["$distanceKm", 100] }, 100] },
                ],
              },
            ],
          },
        },
      });
    }

    // --- final weighted score ---
    pipeline.push({
      $addFields: {
        score: {
          $add: [
            // prefer fuller profiles a little
            "$complNorm",

            // similarity features
            { $multiply: [0.25, "$interestScore"] },
            { $multiply: [0.15, "$valueScore"] },
            { $multiply: [0.2, "$journeyScore"] }, // exact name
            { $multiply: [0.15, "$journeyAffinity"] }, // preference boost
            { $multiply: [0.2, "$diagScore"] }, // diagnosis name
            { $multiply: [0.1, "$diagTypeScore"] }, // diagnosis type (lower)
            { $multiply: [0.15, "$therapyScore"] }, // therapy name
            { $multiply: [0.08, "$therapyTypeScore"] }, // therapy type (lower)
            { $multiply: [0.1, "$ageScore"] },
            { $multiply: [0.12, "$complAffinity"] },

            // inbound like soft boost
            { $multiply: [0.2, "$inboundLiked"] },

            // geo
            myHasGeo ? { $multiply: [0.2, "$geoScore"] } : 0,
          ],
        },
      },
    });

    // --- sort & limit ---
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
    pipeline.push({
      $sort: myHasGeo
        ? { score: -1, distanceKm: 1, _id: -1 }
        : { score: -1, _id: -1 },
    });
    pipeline.push({ $limit: safeLimit });

    return await Profile.aggregate(pipeline);
  },
};
