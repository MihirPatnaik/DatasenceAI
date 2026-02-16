// src/smartsocial/utils/userContext.ts

import { doc, getDoc, updateDoc } from "firebase/firestore"; // 🆕 Added updateDoc
import { getPlan, getPlanFeatures } from "../services/planService";
import { auth, db } from "./firebase";

export interface UserContextData {
  onboarding: {
    plan: "free" | "pro";
    completed: boolean;
    progress: number;
    celebrated?: boolean;
  };
  industry: string;
  campaignType: string;
  tone: string;
  targetPlatform: string;
  firstTooltipShown?: boolean;

  // new: plan metadata + features
  plan?: any;
  planFeatures?: Record<string, any>;
  planSource?: "firestore" | "fallback"; // 🔥 new
  
  // 🆕 AUTO-PILOT SCHEDULER: Timezone support
  timezone?: string;
}

// ✅ In-memory cache (lives until page reload)
const userContextCache: Record<string, UserContextData> = {};

// ✅ Defaults (safe fallbacks)
const DEFAULT_CONTEXT: UserContextData = {
  onboarding: {
    plan: "free",
    completed: false,
    progress: 0,
    celebrated: false,
  },
  industry: "General",
  campaignType: "General Campaign",
  tone: "Neutral",
  targetPlatform: "Instagram",
  // 🆕 Default timezone (will be auto-detected)
  timezone: "UTC",
};

/**
 * 🆕 Auto-detect user's timezone from browser
 */
function detectUserTimezone(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log("🌍 Auto-detected timezone:", timezone);
    return timezone;
  } catch (error) {
    console.warn("❌ Timezone detection failed, using UTC:", error);
    return "UTC";
  }
}

/**
 * Fetches user context from Firestore (with caching + defaults).
 * @param uid optional, falls back to auth.currentUser?.uid
 */
export async function getUserContext(uid?: string): Promise<UserContextData> {
  const userId = uid || auth.currentUser?.uid;
  if (!userId) {
    throw new Error("⚠️ No user logged in or UID provided");
  }

  // 1) Return from cache if available
  if (userContextCache[userId]) {
    return userContextCache[userId];
  }

  try {
    // 2) Fetch from Firestore
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);

    // 🆕 Auto-detect timezone (runs every time for fresh detection)
    const detectedTimezone = detectUserTimezone();

    if (!snap.exists()) {
      console.warn(`⚠️ User ${userId} not found in Firestore. Using defaults.`);
      const contextWithTimezone = {
        ...DEFAULT_CONTEXT,
        timezone: detectedTimezone, // 🆕 Include detected timezone
      };
      userContextCache[userId] = contextWithTimezone;
      return contextWithTimezone;
    }

    const data = snap.data() as any;
    const planId = data.planId || data.onboarding?.plan || "free";

    // fetch plan metadata
    const planMeta = await getPlan(planId);

    // fetch plan features (Firestore-first, fallback safe)
    let planFeatures = await getPlanFeatures(planId);
    let planSource: "firestore" | "fallback" = "firestore";

    if (!planFeatures || Object.keys(planFeatures).length === 0) {
      console.warn(`⚠️ Using fallback PlanPermissions for planId=${planId}`);
      // import PlanPermissions only here to avoid circular deps
      const { default: Fallbacks } = await import("./planFallback");
      planFeatures = Fallbacks[planId] || {};
      planSource = "fallback";
    }

    // 🔥 Debug logs
    console.log("[DEV] planMeta for", planId, "=>", planMeta);
    console.log("[DEV] planFeatures for", planId, "=>", planFeatures, `(source=${planSource})`);

    const context: UserContextData = {
      onboarding: {
        plan: (data?.onboarding?.plan === "Pro" ? "pro" : "free") as "free" | "pro",
        completed: !!data?.onboarding?.completed,
        progress: data?.onboarding?.progress ?? 0,
        celebrated: data?.onboarding?.celebrated ?? false,
      },
      industry: data?.industry || DEFAULT_CONTEXT.industry,
      campaignType: data?.campaignType || DEFAULT_CONTEXT.campaignType,
      tone: data?.tone || DEFAULT_CONTEXT.tone,
      targetPlatform: data?.targetPlatform || DEFAULT_CONTEXT.targetPlatform,
      firstTooltipShown: data?.firstTooltipShown ?? false,
      plan: planMeta,
      planFeatures,
      planSource,
      // 🆕 Use stored timezone or auto-detect
      timezone: data?.timezone || detectedTimezone,
    };

    // 3) Cache result for next time
    userContextCache[userId] = context;
    return context;
  } catch (err) {
    console.error("❌ getUserContext failed:", err);
    const contextWithTimezone = {
      ...DEFAULT_CONTEXT,
      timezone: detectUserTimezone(), // 🆕 Include timezone even on error
    };
    userContextCache[userId] = contextWithTimezone;
    return contextWithTimezone;
  }
}

/**
 * Clear cache for a specific user or all users.
 */
export function clearUserContextCache(uid?: string) {
  if (uid) {
    delete userContextCache[uid];
  } else {
    Object.keys(userContextCache).forEach((key) => delete userContextCache[key]);
  }
}

/**
 * 🆕 Utility function to get current user's timezone
 * Useful for components that need timezone without full context
 */
export function getCurrentUserTimezone(): string {
  const userId = auth.currentUser?.uid;
  if (userId && userContextCache[userId]?.timezone) {
    return userContextCache[userId].timezone!;
  }
  return detectUserTimezone();
}

/**
 * 🆕 Update user's timezone preference
 * Can be used if user wants to manually set timezone
 */
export async function updateUserTimezone(timezone: string, uid?: string): Promise<void> {
  const userId = uid || auth.currentUser?.uid;
  if (!userId) {
    throw new Error("⚠️ No user logged in to update timezone");
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { timezone }); // ✅ Now updateDoc is imported
    
    // Update cache
    if (userContextCache[userId]) {
      userContextCache[userId].timezone = timezone;
    }
    
    console.log("✅ Updated user timezone to:", timezone);
  } catch (error) {
    console.error("❌ Failed to update timezone:", error);
    throw error;
  }
}