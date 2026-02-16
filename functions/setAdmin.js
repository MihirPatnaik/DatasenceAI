//functions/setAdmin.js


import admin from "firebase-admin";
import { readFileSync } from "fs";

// 🔑 Replace with path to your Firebase Admin SDK service account key JSON
const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf-8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function setAdmin(email) {
  try {
    // 🔎 Lookup user by email
    const user = await admin.auth().getUserByEmail(email);

    // 🛡️ Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    console.log(`✅ ${email} is now an admin! (uid: ${user.uid})`);
  } catch (err) {
    console.error("❌ Error setting admin:", err);
  }
}

// 👇 Replace with your email
setAdmin("mihir.patnaik@gmail.com");
