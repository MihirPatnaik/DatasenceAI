// functions/src/index.ts

import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

// ---------- INIT ----------
admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ 
  region: "us-central1", 
  maxInstances: 5
});

interface UpdateUserPlanData {
  uid?: string;
  newPlan?: string;
  planId?: string;
  features?: Record<string, any>;
}

// ---------- CALLABLE FUNCTION ----------
export const adminUpdatePlan = onCall(
  { region: "us-central1" },
  async (request) => {
    // ✅ Authentication check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // ✅ Admin check
    if (!request.auth.token.admin) {
      throw new HttpsError("permission-denied", "Admin privileges required");
    }

    const data = request.data as UpdateUserPlanData;
    console.log("📥 Received update request:", data);

    // ✅ Input validation
    if (!data) {
      throw new HttpsError("invalid-argument", "No data provided");
    }

    try {
      // Case B: Update plan features
      if (data.planId && data.features) {
        console.log(`🔄 Updating features for plan: ${data.planId}`, data.features);
        
        const batch = db.batch();
        const updatedFeatures: string[] = [];

        Object.entries(data.features).forEach(([featureKey, featureValue]) => {
          const featureRef = db
            .collection("plans")
            .doc(data.planId!)
            .collection("planFeatures")
            .doc(featureKey);

          // ✅ FIX: Extract the actual value properly to prevent nesting
          let actualValue = featureValue;
          
          // Handle {value: actualValue} structure
          if (featureValue && typeof featureValue === 'object' && 'value' in featureValue) {
            actualValue = featureValue.value;
          }
          
          // Handle double-nested {value: {value: actualValue}}
          if (actualValue && typeof actualValue === 'object' && 'value' in actualValue) {
            actualValue = actualValue.value;
          }

          // ✅ Store the clean value directly
          batch.set(featureRef, {
            value: actualValue,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
          
          updatedFeatures.push(featureKey);
        });

        await batch.commit();
        
        return { 
          success: true, 
          message: `Updated ${updatedFeatures.length} features for ${data.planId}`,
          type: "planFeatures",
          updatedFeatures: updatedFeatures
        };
      }

      // ✅ No valid operation found
      throw new HttpsError("invalid-argument", "Invalid payload: must provide planId and features");

    } catch (error) {
      console.error("❌ Function error:", error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError("internal", "An unexpected error occurred");
    }
  }
);

// ---------- EXPORT ----------
export { setAdminClaim } from "./setAdmin";