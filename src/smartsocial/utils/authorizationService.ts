// src/smartsocial/utils/authorizationService.ts

import { User, AppFeature } from "../types/User";
import { getUserById } from "./userService";
import { getPlanFeatures } from "../services/planService";

/**
 * Static fallback map (used only if Firestore features are missing).
 * Must stay in sync with your Firestore defaults.
 */
const PlanPermissions: Record<string, Record<AppFeature, string | number | null>> = {
  free: {
    analytics_access: "read-only",
    image_quality: "standard",
    max_posts_per_month: 5,
    social_connections: 1,
    support_level: "community",
    templates: "basic",
  },
  Pro: {
    analytics_access: "full",
    image_quality: "high",
    max_posts_per_month: null, // null = unlimited
    social_connections: 5,
    support_level: "priority",
    templates: "advanced",
  },
};

export interface FeatureCheckResult {
  allowed: boolean;
  reason?: string;
  limit?: number | null;
  source: "firestore" | "fallback";
}

/**
 * Generic check: can user perform a feature based on usage?
 * Firestore → fallback to static if missing.
 */
export async function canPerformAction(
  uid: string,
  featureKey: AppFeature,
  usageCount = 0
): Promise<FeatureCheckResult> {
  const user = await getUserById(uid);
  if (!user) return { allowed: false, reason: "user_not_found", source: "fallback" };

  const planId = user.planId || user.onboarding?.plan || "free";

  // 1) Try Firestore first
  let features = await getPlanFeatures(planId);
  let source: "firestore" | "fallback" = "firestore";

  // 2) If missing/empty, fallback to static map
  if (!features || Object.keys(features).length === 0) {
    console.warn(`⚠️ Using fallback PlanPermissions for planId=${planId}`);
    features = PlanPermissions[planId] || {};
    source = "fallback";
  }

  if (!(featureKey in features)) {
    return { allowed: false, reason: "feature_not_available", source };
  }

  const value = features[featureKey];

  // null → unlimited
  if (value === null) return { allowed: true, limit: null, source };

  const limit = typeof value === "number" ? value : Number(value);

  if (!isNaN(limit) && usageCount >= limit) {
    return { allowed: false, reason: "quota_exhausted", limit, source };
  }

  return { allowed: true, limit, source };
}

export class AuthorizationService {
  /**
   * Quick check (legacy) — uses fallback only.
   * Use canPerformAction() if you want Firestore + debug source.
   */
  static canUseFeature(user: User, feature: AppFeature): boolean {
    const planId = (user.planId || user.onboarding?.plan) as string;
    const features =
      PlanPermissions[planId] || PlanPermissions["free"]; // fallback safe

    const permission = features[feature];
    if (permission === undefined) return false;

    if (typeof permission === "number") return permission > 0;
    return !!permission;
  }

  /**
   * Get the raw value of a feature (e.g. "high", 5, null).
   * Fallback only — for Firestore-aware values use canPerformAction().
   */
  static getFeatureValue(
    user: User,
    feature: AppFeature
  ): string | number | null {
    const planId = (user.planId || user.onboarding?.plan) as string;
    const features =
      PlanPermissions[planId] || PlanPermissions["free"]; // fallback safe
    return features[feature] ?? null;
  }
}
