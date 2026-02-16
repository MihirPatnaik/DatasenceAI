// src/smartsocial/services/quotaService.ts

import type { Firestore } from "firebase/firestore";
import {
  doc,
  getDoc,
  runTransaction,
  Timestamp
} from "firebase/firestore";

/**
 * Plan types used within the business logic.
 * ctx.onboarding.plan is "free" | "pro" and we map "pro" -> "pro_399"
 */
export type PlanKey = "free" | "pro_399" | "pro_699" | "pro_999";

export type OnboardingPlan = "free" | "pro";

/** Quotas returned for a plan */
export interface PlanLimits {
  captions: number | null; // null => unlimited
  images: number | null;
  posts: number | null;
  extension?: number | null; // ✅ Add extension quota
  features?: {
    multiPlatformPosting?: boolean;
    scheduling?: boolean;
    advancedAnalytics?: boolean;
  };
}

/** Default plan definitions — tweak numbers as required */
const planLimits: Record<PlanKey, PlanLimits> = {
  free: {
    captions: 5,
    images: 2,
    posts: 10,
    extension: 20, // ✅ Add extension quota limits
    features: {
      multiPlatformPosting: false,
      scheduling: false,
      advancedAnalytics: false,
    },
  },
  pro_399: {
    captions: 100,
    images: 50,
    posts: 500,
    extension: 1000, // ✅ Add extension quota limits
    features: {
      multiPlatformPosting: true,
      scheduling: true,
      advancedAnalytics: false,
    },
  },
  pro_699: {
    captions: 300,
    images: 150,
    posts: 1500,
    extension: 5000, // ✅ Add extension quota limits
    features: {
      multiPlatformPosting: true,
      scheduling: true,
      advancedAnalytics: true,
    },
  },
  pro_999: {
    captions: null, // unlimited
    images: null,
    posts: null,
    extension: null, // ✅ Unlimited for highest plan
    features: {
      multiPlatformPosting: true,
      scheduling: true,
      advancedAnalytics: true,
    },
  },
};

/** Map onboarding.plan ("free"|"pro") -> PlanKey */
export function normalizePlan(onboardingPlan: OnboardingPlan): PlanKey {
  if (onboardingPlan === "pro") {
    // business rule: old "Pro" -> pro_399
    return "pro_399";
  }
  return "free";
}

/** Returns plan limits for a given onboarding plan (or normalized PlanKey) */
export function getPlanLimits(onboardingPlanOrPlanKey: OnboardingPlan | PlanKey): PlanLimits {
  const planKey: PlanKey =
    onboardingPlanOrPlanKey === "free" || onboardingPlanOrPlanKey === "pro"
      ? normalizePlan(onboardingPlanOrPlanKey)
      : (onboardingPlanOrPlanKey as PlanKey);

  return planLimits[planKey];
}

/**
 * Quota doc shape in Firestore (per-user).
 */
export interface UserQuotaDoc {
  // ✅ Consistent field names
  usedCaptionQuota?: number;
  captionQuota?: number | null;
  usedImageQuota?: number;
  imageQuota?: number | null;
  usedPostQuota?: number;
  postQuota?: number | null;
  usedExtensionQuota?: number; // ✅ Add this
  extensionQuota?: number | null; // ✅ Add this
  updatedAt?: any;
  consumedTokens?: Record<string, { key: string; createdAt: any }>;
}

/** Keys allowed to be consumed */
export type QuotaKey = "usedCaptionQuota" | "usedImageQuota" | "usedPostQuota" | "usedExtensionQuota";

/** Standard response from consumeQuota */
export interface ConsumeResult {
  success: boolean;
  code: "OK" | "INSUFFICIENT" | "UNLIMITED" | "NOT_FOUND" | "ERROR" | "ALREADY_CONSUMED";
  message: string;
  remaining?: number | null; // null for unlimited
  used?: number; // Add this property
  limit?: number; // Add this property
}

/**
 * NOTE: This implementation **always** targets the sub-doc:
 *   users/{userId}/quota/meta
 *
 * This avoids invalid single-path doc refs like `users/${uid}/quota`.
 */
export async function consumeQuota(
  db: Firestore,
  userId: string,
  onboardingPlan: OnboardingPlan,
  quotaKey: QuotaKey,
  amount = 1,
  options?: {
    docPath?: string;
    idempotencyKey?: string;
  }
): Promise<ConsumeResult> {
  if (!userId) {
    return {
      success: false,
      code: "ERROR",
      message: "Missing userId",
    };
  }
  if (amount <= 0 || !Number.isInteger(amount)) {
    return {
      success: false,
      code: "ERROR",
      message: "Amount must be a positive integer",
    };
  }

  const planKey = normalizePlan(onboardingPlan);
  const limits = getPlanLimits(planKey);

  // Map quotaKey to plan limit
 const planLimitValue =
  quotaKey === "usedCaptionQuota"
    ? limits.captions
    : quotaKey === "usedImageQuota"
    ? limits.images
    : quotaKey === "usedPostQuota"
    ? limits.posts
    : limits.extension; // ✅ Add extension

  // If plan limit is null => unlimited
  if (planLimitValue === null) {
    return {
      success: true,
      code: "UNLIMITED",
      message: "Plan allows unlimited usage of this resource",
      remaining: null,
    };
  }

  // Force the correct quota path: users/{uid}/quota/meta
  // If someone passes explicit docPath, we still prefer strongly-typed ref creation.
  const quotaDocRef = doc(db, "users", userId, "quota", "meta");

  try {
    const result = await runTransaction(db, async (tx) => {
      const snap = await tx.get(quotaDocRef);

      let quotaDoc: UserQuotaDoc = snap.exists() ? (snap.data() as UserQuotaDoc) : {};

      // initialize missing remaining fields from plan limits
      if (!snap.exists()) {
        quotaDoc = {
          usedCaptionQuota: 0,
          captionQuota: limits.captions,
          usedImageQuota: 0,
          imageQuota: limits.images,
          usedPostQuota: 0,
          postQuota: limits.posts ?? null,
          updatedAt: Timestamp.now(),
          consumedTokens: {},
        };
        tx.set(quotaDocRef, quotaDoc);
      } else {
        // Ensure fields exist with defaults
        if (quotaDoc.usedCaptionQuota === undefined) quotaDoc.usedCaptionQuota = 0;
        if (quotaDoc.captionQuota === undefined) quotaDoc.captionQuota = limits.captions;
        if (quotaDoc.usedImageQuota === undefined) quotaDoc.usedImageQuota = 0;
        if (quotaDoc.imageQuota === undefined) quotaDoc.imageQuota = limits.images;
        if (quotaDoc.usedPostQuota === undefined) quotaDoc.usedPostQuota = 0;
        if (quotaDoc.postQuota === undefined) quotaDoc.postQuota = limits.posts;
      }

      // Idempotency check (existing logic)
      if (options?.idempotencyKey) {
        const tokens = quotaDoc.consumedTokens ?? {};
        if (tokens[options.idempotencyKey]) {
          return {
            success: false,
            code: "ALREADY_CONSUMED",
            message: "This operation has already been applied",
            remaining: quotaDoc[quotaKey] ?? 0,
          } as ConsumeResult;
        }
      }


      const currentUsed = quotaDoc[quotaKey] ?? 0;
      const quotaLimit = 
      quotaKey === "usedCaptionQuota" ? quotaDoc.captionQuota :
      quotaKey === "usedImageQuota" ? quotaDoc.imageQuota :
      quotaKey === "usedPostQuota" ? quotaDoc.postQuota :
      quotaDoc.extensionQuota; // ✅ Add extension

 if (currentUsed + amount > (quotaLimit ?? 0)) {
        return {
          success: false,
          code: "INSUFFICIENT",
          message: `Insufficient ${quotaKey} (used ${currentUsed + amount}, limit ${quotaLimit})`,
          remaining: currentUsed,
        } as ConsumeResult;
      }
      
      const newUsed = currentUsed + amount;

      // Update the used counter
      const updatePayload: Partial<UserQuotaDoc> = {
        updatedAt: Timestamp.now(),
        [quotaKey]: newUsed,
      };


      // Add consumedTokens if idempotencyKey provided
      if (options?.idempotencyKey) {
        updatePayload.consumedTokens = {
          ...(quotaDoc.consumedTokens ?? {}),
          [options.idempotencyKey]: { key: options.idempotencyKey, createdAt: Timestamp.now() },
        };
      }

      tx.update(quotaDocRef, updatePayload);

      return {
        success: true,
        code: "OK",
        message: "Quota consumed",
        remaining: newUsed,
      } as ConsumeResult;
    });

    return result as ConsumeResult;
  } catch (err: any) {
    console.error("consumeQuota error", err);
    return {
      success: false,
      code: "ERROR",
      message: err?.message ?? "Unknown error",
    };
  }
}

/** Get current used quota and limits */
export async function getRemaining(
  db: Firestore,
  userId: string,
  onboardingPlan: OnboardingPlan,
  quotaKey: QuotaKey
): Promise<{ success: boolean; used?: number; limit?: number | null; code?: string; message?: string }> {
  const planKey = normalizePlan(onboardingPlan);
  const limits = getPlanLimits(planKey);

  const quotaDocRef = doc(db, "users", userId, "quota", "meta");

  try {
    const snap = await getDoc(quotaDocRef);
    if (!snap.exists()) {
      // Not created yet -> return defaults (0 used)
      const defaultUsed = 0;
      const defaultLimit = 
        quotaKey === "usedCaptionQuota" ? limits.captions :
        quotaKey === "usedImageQuota" ? limits.images :
        limits.posts;
      
      return { 
        success: true, 
        used: defaultUsed, 
        limit: defaultLimit,
        code: "NOT_INITIALIZED", 
        message: "Quota doc not found, using defaults" 
      };
    }
    const quota = snap.data() as UserQuotaDoc;
    const used = quota[quotaKey] ?? 0;
    const limit = 
      quotaKey === "usedCaptionQuota" ? quota.captionQuota :
      quotaKey === "usedImageQuota" ? quota.imageQuota :
      quota.postQuota;

    return { success: true, used, limit };
  } catch (err: any) {
    return { success: false, code: "ERROR", message: err?.message ?? "Unknown" };
  }
}
