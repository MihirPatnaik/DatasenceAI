//src/smartsocial/utils/permissions.ts

import { getPlanFeatures } from "../services/planService";
import { normalizePlanId } from "./planHelpers";

const cache: Record<string, { ts: number; features: Record<string, any> }> = {};

async function loadPlanFeatures(planId: string) {
  const key = normalizePlanId(planId);
  const now = Date.now();
  if (cache[key] && now - cache[key].ts < 1000 * 60 * 5) return cache[key].features; // 5min cache
  const features = await getPlanFeatures(key);
  cache[key] = { ts: now, features };
  return features;
}

/**
 * Returns true/false for boolean features, and { allowed:true, limit } for numeric limits.
 */
export async function isFeatureAllowed(user: any, featureKey: string, usageCount = 0) {
  const planId = normalizePlanId(user?.planId);
  const features = await loadPlanFeatures(planId);
  if (!features || !(featureKey in features)) return { allowed: false, source: "missing" };
  const val = features[featureKey];
  if (val === null) return { allowed: true, source: "firestore", limit: null };
  if (typeof val === "boolean") return { allowed: val, source: "firestore", limit: val ? null : 0 };
  if (typeof val === "number") {
    return { allowed: usageCount < val, source: "firestore", limit: val };
  }
  // strings (e.g., analytics_access)
  return { allowed: true, source: "firestore", value: val };
}
