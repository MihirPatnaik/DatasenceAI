//functions/src/index.ts

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { onCall, HttpsError, CallableRequest, onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

// Global settings
setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

admin.initializeApp();
const db = admin.firestore();

interface UpdateUserPlanData {
  uid: string;
  newPlan: string;
}

interface UpdatePlanFeatureData {
  planId: string;
  featureKey?: string;
  value?: any;
  features?: Record<string, any>; // ✅ bulk update
}

// ✅ Callable version
export const adminUpdatePlan = onCall(
  async (request: CallableRequest<any>): Promise<any> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Not signed in");
    }

    const data = request.data || {};

    // Case 1: Update user plan
    if ((data as UpdateUserPlanData).uid && (data as UpdateUserPlanData).newPlan) {
      const { uid, newPlan } = data as UpdateUserPlanData;
      await db.collection("users").doc(uid).set({ planId: newPlan }, { merge: true });
      return { success: true, type: "userPlan", uid, newPlan };
    }

    // Case 2a: Single feature
    if ((data as UpdatePlanFeatureData).planId && (data as UpdatePlanFeatureData).featureKey) {
      const { planId, featureKey, value } = data as UpdatePlanFeatureData;
      await db.collection("plans").doc(planId).collection("planFeatures").doc(featureKey!).set({ value }, { merge: true });
      return { success: true, type: "planFeature", planId, featureKey, value };
    }

    // Case 2b: Bulk features
    if ((data as UpdatePlanFeatureData).planId && (data as UpdatePlanFeatureData).features) {
      const { planId, features } = data as UpdatePlanFeatureData;
      const batch = db.batch();

      Object.entries(features!).forEach(([key, value]) => {
        const fRef = db.collection("plans").doc(planId).collection("planFeatures").doc(key);
        batch.set(fRef, { value }, { merge: true });
      });

      await batch.commit();
      return { success: true, type: "bulkFeatures", planId, count: Object.keys(features!).length };
    }

    throw new HttpsError(
      "invalid-argument",
      "Invalid payload. Expected { uid, newPlan } OR { planId, featureKey, value } OR { planId, features }"
    );
  }
);

// 🚀 HTTP fallback (for emulator)
export const adminUpdatePlanHttp = onRequest(
  { cors: true, region: "us-central1" },
  async (request, response) => {
    try {
      const data = request.body;

      // Same 3 cases here
      if (data.uid && data.newPlan) {
        await db.collection("users").doc(data.uid).set({ planId: data.newPlan }, { merge: true });
        response.json({ success: true, type: "userPlan", uid: data.uid, newPlan: data.newPlan });
        return;
      }

      if (data.planId && data.featureKey) {
        await db.collection("plans").doc(data.planId).collection("planFeatures").doc(data.featureKey).set({ value: data.value }, { merge: true });
        response.json({ success: true, type: "planFeature", planId: data.planId, featureKey: data.featureKey, value: data.value });
        return;
      }

      if (data.planId && data.features) {
        const batch = db.batch();
        Object.entries(data.features).forEach(([key, value]) => {
          const fRef = db.collection("plans").doc(data.planId).collection("planFeatures").doc(key);
          batch.set(fRef, { value }, { merge: true });
        });
        await batch.commit();
        response.json({ success: true, type: "bulkFeatures", planId: data.planId, count: Object.keys(data.features).length });
        return;
      }

      response.status(400).json({ error: "Invalid payload" });
    } catch (err: any) {
      console.error("❌ adminUpdatePlanHttp error:", err);
      response.status(500).json({ error: err.message || "Internal error" });
    }
  }
);
