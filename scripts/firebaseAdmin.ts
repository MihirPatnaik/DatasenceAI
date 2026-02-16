// scripts/firebaseAdmin.ts

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = require("../serviceAccountKey.json"); // <-- your Firebase Admin key

const app = initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore(app);
