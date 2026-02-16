// src/smartsocial/utils/firebase.ts

import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// ✅ Production config (values injected at build time)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: "datasenceai-c4e5f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Core Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");
export { app };

// Configure auth persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Auth persistence: Local Storage");
  })
  .catch((error) => {
    console.error("❌ Auth persistence error:", error);
  });

// Google Auth provider
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ 
  prompt: "select_account",
  login_hint: "" 
});

// Add scopes if needed
provider.addScope('email');
provider.addScope('profile');

console.log("☁️ Firebase PRODUCTION connected");
console.log("✅ Project ID:", firebaseConfig.projectId);
console.log("✅ Functions region: us-central1");
console.log("✅ Storage bucket: datasenceai-c4e5f.firebasestorage.app");