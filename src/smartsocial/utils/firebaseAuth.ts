// src/smartsocial/utils/firebaseAuth.ts

import { auth, provider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  return result.user; // contains email, uid, displayName, photoURL
}

export async function logout() {
  return signOut(auth);
}
