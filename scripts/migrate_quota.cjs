// scripts/migrate_quota.cjs

const admin = require("firebase-admin");
const fs = require("fs");

// Absolute path to your key file
const SERVICE_ACCOUNT_PATH = "D:/datasenceai/functions/serviceAccountKey.json";

// Check file exists
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("❌ Service account file not found at:", SERVICE_ACCOUNT_PATH);
  process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);

// Init Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Plan limits mapping
const PLAN_LIMITS = {
  free: { captions: 5, images: 2, posts: 10 },
  pro: { captions: 100, images: 50, posts: 500 },
  pro_399: { captions: 100, images: 50, posts: 500 }
};

// ---- MIGRATION LOGIC ----
async function migrate() {
  const usersSnap = await db.collection("users").get();
  console.log("📊 Found users:", usersSnap.size);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const udoc of usersSnap.docs) {
    const uid = udoc.id;
    const data = udoc.data();
    if (!data) {
      skipped++;
      continue;
    }

    try {
      // Determine user's plan
      const plan = data.onboarding?.plan || "free";
      const planKey = plan === "pro" ? "pro_399" : "free";
      const limits = PLAN_LIMITS[planKey] || PLAN_LIMITS.free;

      // Check if user already has new quota structure
      const newQuotaRef = db.doc(`users/${uid}/quota/meta`);
      const newQuotaSnap = await newQuotaRef.get();

      if (newQuotaSnap.exists) {
        const existingData = newQuotaSnap.data();
        // Check if already has the new field structure
        if (existingData.usedCaptionQuota !== undefined || 
            existingData.captionQuota !== undefined) {
          console.log(`⏭️ ${uid}: Already has new quota structure, skipping`);
          skipped++;
          continue;
        }
      }

      // Calculate USED quota from old system
      let usedCaptionQuota = 0;
      let usedImageQuota = 0;
      let usedPostQuota = 0;

      // Method 1: Check old root-level quota
      if (data.quota && typeof data.quota.used === 'number') {
        // Old system had generic "used" count - distribute proportionally
        const totalUsed = data.quota.used;
        usedCaptionQuota = Math.min(totalUsed, limits.captions);
        usedImageQuota = Math.min(Math.floor(totalUsed / 5), limits.images); // Estimate images used
        usedPostQuota = Math.min(Math.floor(totalUsed / 2), limits.posts); // Estimate posts used
      }

      // Method 2: Check if they have old remaining-based quota doc
      const oldQuotaRef = db.doc(`users/${uid}/quota/usage`);
      const oldQuotaSnap = await oldQuotaRef.get();
      
      if (oldQuotaSnap.exists) {
        const oldQuota = oldQuotaSnap.data();
        
        // Convert from remaining to used
        if (oldQuota.captionsRemaining !== undefined) {
          usedCaptionQuota = Math.max(0, limits.captions - oldQuota.captionsRemaining);
        }
        if (oldQuota.imagesRemaining !== undefined) {
          usedImageQuota = Math.max(0, limits.images - oldQuota.imagesRemaining);
        }
      }

      // Ensure we don't exceed limits
      usedCaptionQuota = Math.min(usedCaptionQuota, limits.captions);
      usedImageQuota = Math.min(usedImageQuota, limits.images);
      usedPostQuota = Math.min(usedPostQuota, limits.posts);

      // Create new quota structure
      const newQuotaData = {
        usedCaptionQuota: usedCaptionQuota,
        captionQuota: limits.captions,
        usedImageQuota: usedImageQuota,
        imageQuota: limits.images,
        usedPostQuota: usedPostQuota,
        postQuota: limits.posts,
        planKey: planKey,
        migratedFromOldSystem: true,
        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Write to the CORRECT path: users/{uid}/quota/meta
      await newQuotaRef.set(newQuotaData, { merge: true });

      migrated++;
      console.log(`✅ Migrated ${uid}:`, {
        captions: `${usedCaptionQuota}/${limits.captions}`,
        images: `${usedImageQuota}/${limits.images}`,
        posts: `${usedPostQuota}/${limits.posts}`,
        plan: planKey
      });

    } catch (error) {
      errors++;
      console.error(`❌ Error migrating ${uid}:`, error.message);
    }
  }

  console.log("\n🚀 MIGRATION SUMMARY:");
  console.log(`✅ Successfully migrated: ${migrated}`);
  console.log(`⏭️ Skipped (already migrated): ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📊 Total processed: ${usersSnap.size}`);

  process.exit(0);
}

// Run migration
migrate().catch(err => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});