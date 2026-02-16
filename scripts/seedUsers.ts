// scripts/seedUsers.ts
import { db } from "./firebaseAdmin";
import { doc, setDoc } from "firebase/firestore";

async function seed() {
  const users = {
    demoFreeUser: {
      type: "free",
      quota: { captionsLeft: 10, imagesLeft: 5 },
      context: { industry: "", campaignType: "", tone: "" },
    },
    demoProUser: {
      type: "pro",
      quota: { captionsLeft: 9999, imagesLeft: 9999 },
      context: { industry: "", campaignType: "", tone: "" },
    },
  };

  for (const [id, data] of Object.entries(users)) {
    await setDoc(doc(db, "users", id), data);
    console.log(`✅ Seeded user: ${id}`);
  }
}

seed()
  .then(() => {
    console.log("🎉 Seeding complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error seeding:", err);
    process.exit(1);
  });
