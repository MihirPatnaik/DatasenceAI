// src/utils/firebaseLogger.ts

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Agent log base shape.
 * `prompt` is required. Other fields (caption, status, modelUsed, tokensUsed, idempotencyKey, etc.)
 * are optional and any additional metadata is allowed.
 */
export interface AgentLogBase {
  prompt: string;
  caption?: string | null;
  status?: string;
  timestamp?: any;
  [key: string]: any;
}

/**
 * Core logger implementation (internal).
 * Accepts flexible metadata so callers can include modelUsed, tokensUsed, idempotencyKey, etc.
 */
const _logToFirebase = async (logData: AgentLogBase) => {
  try {
    await addDoc(collection(db, "agent_logs"), {
      ...logData,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("🔥 Firebase log failed:", error);
  }
};

/**
 * Public exports:
 * - logToFirebase (legacy name so existing callsites keep working)
 * - logAgentToFirebase (explicit new name to avoid collisions)
 *
 * Both reference the same implementation.
 */
export const logToFirebase = _logToFirebase;
export const logAgentToFirebase = _logToFirebase;

//
// 🔍 CHECK PROMPT-BASED CACHE
//
export const checkFirebaseCache = async (
  prompt: string,
  status: string = "imagePrompt"
): Promise<string | null> => {
  try {
    const logsRef = collection(db, "agent_logs");
    const q = query(
      logsRef,
      where("prompt", "==", prompt),
      where("status", "==", status)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const firstDoc = snapshot.docs[0];
      const maybeCaption = firstDoc.data()?.caption;
      return typeof maybeCaption === "string" ? maybeCaption : null;
    }
    return null;
  } catch (error) {
    console.error("🔥 Firebase cache check failed:", error);
    return null;
  }
};

//
// ✅ CHECK IF SVG DIAGRAM IS CACHED
//
export const getCachedSVG = async (prompt: string): Promise<string | null> => {
  try {
    const docRef = doc(db, "svg_diagrams", encodeURIComponent(prompt));
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return typeof data?.svg === "string" ? data.svg : null;
    }
    return null;
  } catch (error) {
    console.error("🔥 SVG cache check failed:", error);
    return null;
  }
};

//
// ✅ SAVE SVG DIAGRAM TO FIREBASE
//
export const saveSVGToCache = async (prompt: string, svg: string): Promise<void> => {
  try {
    const docRef = doc(db, "svg_diagrams", encodeURIComponent(prompt));
    await setDoc(docRef, {
      prompt,
      svg,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("🔥 SVG Firebase caching failed:", error);
  }
};
