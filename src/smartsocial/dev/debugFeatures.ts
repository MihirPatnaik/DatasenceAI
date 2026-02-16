// src/smartsocial/dev/debugFeatures.ts

import admin from "firebase-admin";

process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"; // ✅ force emulator
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

try {
  admin.initializeApp({
    projectId: "demo-no-project", // ✅ match emulator projectId
  });
} catch (e: any) {
  if (!/already exists/u.test(e.message)) {
    throw e;
  }
}

const db = admin.firestore();

async function debugPlanFeatures(planId = "Pro") {
  try {
    console.log(`🔍 Checking Firestore emulator for ${planId} plan features...`);

    const featuresSnap = await db
      .collection("plans")
      .doc(planId)
      .collection("planFeatures")
      .get();

    if (featuresSnap.empty) {
      console.log("❌ NO FEATURES FOUND - collection is empty");
    } else {
      console.log(`📊 Found ${featuresSnap.size} features:`);
      featuresSnap.forEach((doc) => {
        console.log(`- ${doc.id}:`, doc.data());
      });
    }
  } catch (error) {
    console.error("❌ Debug error:", error);
  }
}

// Support CLI arg: npx ts-node debugFeatures.ts free
const planArg = process.argv[2] || "Pro";
debugPlanFeatures(planArg);
