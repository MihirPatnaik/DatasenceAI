// src/smartsocial/utils/quotaInit.ts


import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import type { OnboardingPlan } from "../services/quotaService";
import { getPlanLimits } from "../services/quotaService";
import { db } from "./firebase";

/**
 * Initialize or reset user quota doc at users/{uid}/quota/meta
 * Using an explicit doc id "meta" avoids ambiguity between collection vs doc.
 */
export async function initializeUserQuota(uid: string, onboardingPlan: OnboardingPlan) {
  const planKey = onboardingPlan === "pro" ? "pro_399" : "free";
  const limits = getPlanLimits(planKey);
  try {
    // explicit doc path: users/{uid}/quota/meta
    const quotaDocRef = doc(db, "users", uid, "quota", "meta");
    await setDoc(
      quotaDocRef,
      {
        // default to plan limits. If you prefer "start at 0", set these to 0.
        usedCaptionQuota: 0,
        captionQuota: limits.captions,
        usedImageQuota: 0, 
        imageQuota: limits.images,
        usedPostQuota: 0,
        postQuota: limits.posts ?? null,
        updatedAt: serverTimestamp(),
        planKey,
      },
      { merge: true }
    );
    console.log("Initialized quota for", uid, planKey, "with 0 used quota");
  } catch (err) {
    console.error("❌ initializeUserQuota error", err);
    throw err;
  }
}
