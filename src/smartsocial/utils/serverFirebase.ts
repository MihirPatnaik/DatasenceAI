// src/smartsocial/utils/serverFirebase.ts

import dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// ✅ CRITICAL: Load environment variables for Node.js
dotenv.config();

// ✅ Server-side Firebase config (uses process.env)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "datasenceai-c4e5f.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

console.log("🔧 Server Firebase Config:", {
  hasApiKey: !!firebaseConfig.apiKey,
  projectId: firebaseConfig.projectId,
  envKeys: Object.keys(process.env).filter(key => key.includes('FIREBASE'))
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Core Firebase services (server-side only - NO auth persistence)
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");
export { app };

console.log("☁️ Firebase SERVER SDK connected");
console.log("✅ Project ID:", firebaseConfig.projectId);
console.log("✅ Storage bucket:", firebaseConfig.storageBucket);