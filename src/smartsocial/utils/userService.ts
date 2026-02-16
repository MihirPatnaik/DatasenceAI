// src/smartsocial/utils/userService.ts

import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { User } from "../types/User";
import { db } from "./firebase";
import { initializeUserQuota } from "./quotaInit";

/**
 * Local typing for the user doc shape used by helper functions.
 */
export interface UserDoc {
  email?: string;
  fullName?: string;
  name?: string; // NEW: Support both fullName and name
  businessEmail?: string;
  provider?: "google" | "email" | string; // ✅ Allow string as well
  createdAt?: any;
  firstTooltipShown?: boolean; // NEW: Missing field
  photoURL?: string; // NEW: Missing field
  quota?: { used?: number; limit?: number };
  recaptcha?: { // NEW: Missing field
    token?: string;
    verifiedAt?: any;
  };
  onboarding?: {
    businessName?: string;
    industry?: string;
    brandVibe?: string;
    campaignType?: string;
    plan?: "free" | "pro" | string; // ✅ Allow string
    quizAnswers?: Record<string, any>;
    progress?: number;
    completed?: boolean;
    celebrated?: boolean;
    [k: string]: any;
  };
  [k: string]: any;
}

/**
 * Save a new user document to Firestore.
 * PRESERVES all original fields while adding new ones.
 */
export const saveUserToFirestore = async (uid: string, data: Partial<UserDoc>) => {
  try {
    console.log("[userService] saveUserToFirestore called for", uid);

    // First, check if user already exists to preserve existing data
    let existingData: Partial<UserDoc> = {};
    try {
      const userSnap = await getDoc(doc(db, "users", uid));
      if (userSnap.exists()) {
        existingData = userSnap.data() as UserDoc;
        console.log("[userService] Found existing user data, preserving structure");
      }
    } catch (err) {
      console.warn("[userService] Could not fetch existing user data:", err);
    }

    // Merge onboarding with proper defaults while preserving existing values
    const normalizedOnboarding = {
      // Defaults
      businessName: "",
      industry: "",
      brandVibe: "",
      campaignType: "",
      plan: "free",
      quizAnswers: {},
      progress: 0,
      completed: false,
      celebrated: false,
      // Preserve existing onboarding
      ...(existingData.onboarding || {}),
      // Apply new onboarding data (overrides existing)
      ...(data?.onboarding || {}),
    };

    // Build complete user data with proper field merging
    const userData = {
      // Preserve all existing fields first
      ...existingData,
      
      // Apply new data (overrides existing)
      ...data,
      
      // Ensure critical fields are set
      createdAt: existingData.createdAt || serverTimestamp(),
      email: data.email || existingData.email || "",
      
      // Handle name/fullName compatibility
      fullName: data.fullName || existingData.fullName || data.name || existingData.name || "",
      name: data.name || existingData.name || data.fullName || existingData.fullName || "",
      
      // Preserve missing fields with defaults
      businessEmail: data.businessEmail || existingData.businessEmail || "",
      firstTooltipShown: data.firstTooltipShown !== undefined ? data.firstTooltipShown : 
                        (existingData.firstTooltipShown !== undefined ? existingData.firstTooltipShown : false),
      photoURL: data.photoURL || existingData.photoURL || "",
      provider: data.provider || existingData.provider || "google",
      
      // Preserve recaptcha data
      recaptcha: data.recaptcha || existingData.recaptcha || { 
        token: "dev-mock-recaptcha-token", 
        verifiedAt: serverTimestamp() 
      },
      
      // Apply merged onboarding
      onboarding: normalizedOnboarding,
      
      // Preserve legacy quota
      quota: data.quota || existingData.quota || { used: 0, limit: 50 },
    };

    // Remove any undefined values to avoid Firestore errors
    const cleanUserData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined)
    );

    // 1) Write/merge the user doc with complete structure
    await setDoc(doc(db, "users", uid), cleanUserData, { merge: true });
    console.log("[userService] User doc written with complete structure for", uid);

    // 2) Initialize the new quota system (if not already exists)
    const planForInit = (normalizedOnboarding.plan as "free" | "pro") || "free";
    
    try {
      await initializeUserQuota(uid, planForInit);
      console.log("[userService] initializeUserQuota succeeded for", uid, planForInit);
    } catch (initErr) {
      console.warn("[userService] initializeUserQuota failed for", uid, initErr);
      // Non-critical error - quota will be initialized on first use
    }

    console.log("✅ User saved with complete structure:", uid);
  } catch (error) {
    console.error("❌ Error saving user:", error);
    throw error;
  }
};

/**
 * Update onboarding fields for a user.
 */
export const updateOnboardingStep = async (uid: string, data: Partial<UserDoc["onboarding"]>) => {
  try {
    const updates: Record<string, any> = {};
    for (const key in data) {
      if (data[key] !== undefined) {
        updates[`onboarding.${key}`] = (data as any)[key];
      }
    }
    await updateDoc(doc(db, "users", uid), updates);
    console.log("✅ Onboarding step updated for user:", uid, updates);
  } catch (error) {
    console.error("❌ Error updating onboarding:", error);
    throw error;
  }
};

export const completeOnboarding = async (uid: string) => {
  try {
    await updateDoc(doc(db, "users", uid), {
      "onboarding.completed": true,
      "onboarding.celebrated": false,
    });
    localStorage.setItem("hasOnboarded", "true");
    console.log("✅ Onboarding completed for user:", uid);
  } catch (error) {
    console.error("❌ Error completing onboarding:", error);
    throw error;
  }
};

export const markOnboardingCelebrated = async (uid: string) => {
  try {
    await updateDoc(doc(db, "users", uid), {
      "onboarding.celebrated": true,
    });
    console.log("🎉 Onboarding celebrated for user:", uid);
  } catch (error) {
    console.error("❌ Error marking celebration:", error);
    throw error;
  }
};

export const getUserById = async (uid: string): Promise<User | null> => {
  try {
    const snapshot = await getDoc(doc(db, "users", uid));
    if (snapshot.exists()) {
      const payload = snapshot.data() as any;
      const planId = payload.planId || payload.onboarding?.plan || "free";
      return { uid, ...payload, planId } as User;
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    throw error;
  }
};