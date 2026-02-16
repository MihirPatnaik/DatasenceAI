// functions/src/consumeQuota.ts

import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";

const db = admin.firestore();

export const consumeQuotaCallable = onCall(
  { region: "us-central1" },
  async (req) => {
    if (!req.auth) throw new Error("unauthenticated");

    const callerUid = req.auth.uid;
    const { quotaKey, planLimit, targetUid } = req.data;

    const userToUpdate = targetUid || callerUid;

    try {
      const result = await db.runTransaction(async (tx) => {
        const userRef = db.collection("users").doc(userToUpdate);
        const snap = await tx.get(userRef);

        if (!snap.exists) {
          return { success: false, reason: "user_not_found" };
        }

        const data = snap.data() as any;
        const quota = data.quota || {};
        const postsUsed = data.postsCreatedThisMonth || 0;

        // UNLIMITED CASE
        if (planLimit === null) {
          tx.update(userRef, {
            postsCreatedThisMonth: postsUsed + 1,
          });
          return { success: true, remaining: null };
        }

        // GENERIC NUMERIC LIMIT
        if (postsUsed >= planLimit) {
          return { success: false, reason: "quota_exhausted", remaining: 0 };
        }

        // APPLY UPDATE
        tx.update(userRef, {
          postsCreatedThisMonth: postsUsed + 1,
        });

        return {
          success: true,
          remaining: planLimit - (postsUsed + 1),
        };
      });

      // result is ALWAYS an object → NO TypeScript error
      return result;

    } catch (err: any) {
      console.error("consumeQuotaCallable error:", err);
      throw new Error(err.message || "internal_error");
    }
  }
);
