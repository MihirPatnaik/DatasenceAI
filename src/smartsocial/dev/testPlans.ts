//src/smartsocial/dev/testPlans.ts

// src/smartsocial/dev/testPlans.ts

import { initializeApp } from "firebase/app";
import fetch from "node-fetch"; // npm install node-fetch@2

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  connectFirestoreEmulator,
} from "firebase/firestore";

// 🔧 Firebase config for emulator
const firebaseConfig = {
  projectId: "demo-no-project", // ✅ match emulator project ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ connect to Firestore emulator
connectFirestoreEmulator(db, "localhost", 8080);

// 🌱 Seed Firestore Plans
async function seedPlans() {
  console.log("🌱 Seeding plans into Firestore Emulator...");

  try {
    // === Free plan ===
    const freeRef = doc(db, "plans", "free");
    if (!(await getDoc(freeRef)).exists()) {
      await setDoc(freeRef, { name: "Free", price: 0, isActive: true });
      console.log("✅ Seeded Free plan");
    } else {
      console.log("ℹ️ Free plan already exists");
    }

    const freeFeatures = {
      analytics_access: "basic",
      image_quality: "medium",
      max_posts_per_month: 10,
      social_connections: 1,
      support_level: "standard",
      templates: "basic",
      posting: false,
    };

    for (const [k, v] of Object.entries(freeFeatures)) {
      const fRef = doc(db, "plans/free/planFeatures", k);
      if (!(await getDoc(fRef)).exists()) {
        await setDoc(fRef, { value: v });
        console.log(`  ➕ Free Feature added: ${k}=${v}`);
      }
    }

    // === Pro plan ===
    const proRef = doc(db, "plans", "Pro");
    if (!(await getDoc(proRef)).exists()) {
      await setDoc(proRef, { name: "Pro", price: 20, isActive: true });
      console.log("✅ Seeded Pro plan");
    } else {
      console.log("ℹ️ Pro plan already exists");
    }

    const proFeatures = {
      analytics_access: "full",
      image_quality: "high",
      max_posts_per_month: null,
      social_connections: 5,
      support_level: "priority",
      templates: "advanced",
      posting: true,
    };

    for (const [k, v] of Object.entries(proFeatures)) {
      const fRef = doc(db, "plans/Pro/planFeatures", k);
      if (!(await getDoc(fRef)).exists()) {
        await setDoc(fRef, { value: v });
        console.log(`  ➕ Pro Feature added: ${k}=${v}`);
      }
    }

    console.log("🌱 Seeding complete");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

// 🌱 Seed Auth Test User (via REST API to emulator)
async function seedAuthUser() {
  const email = "test@example.com";
  const password = "password123";

  try {
    console.log("🌱 Seeding Auth Emulator user via REST API...");
    const res = await fetch(
      "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

if (!res.ok) {
      const err: any = await res.json(); // 👈 cast to any so TS stops complaining
      if (err.error?.message === "EMAIL_EXISTS") {
        console.log("ℹ️ Test user already exists:", email);
      } else {
        throw new Error(JSON.stringify(err));
      }
    } else {
      const data: any = await res.json(); // 👈 cast to any
      console.log("✅ Created test user:", data.localId, email);
    }
  } catch (err: any) {
    console.error("❌ Error seeding Auth user:", err.message || err);
  }
}

async function runSeeder() {
  await seedPlans();
  await seedAuthUser();
}

runSeeder();
