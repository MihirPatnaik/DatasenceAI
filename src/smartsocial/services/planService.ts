// src/smartsocial/services/planService.ts

import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";

/**
 * Get plan doc (metadata) by planId (doc id under "plans")
 */
export async function getPlan(planId: string) {
  if (!planId) return null;
  const planRef = doc(db, "plans", planId);
  const snap = await getDoc(planRef);
  return snap.exists() ? { id: snap.id, ...(snap.data() as any) } : null;
}

/**
 * Returns a key->value map of planFeatures for a given planId.
 * Each plan feature should be stored as a document under:
 *    plans/{planId}/planFeatures/{featureKey} with { value: ... }
 *
 * value === null => unlimited / allowed
 */
export async function getPlanFeatures(planId: string): Promise<Record<string, any>> {
  const result: Record<string, any> = {};
  if (!planId) return result;

  try {
    const colRef = collection(db, "plans", planId, "planFeatures");
    const snap = await getDocs(colRef);
    snap.forEach((d) => {
      // store doc id as key; if value undefined -> null
      const val = (d.data() as any).value;
      result[d.id] = val === undefined ? null : val;
    });
  } catch (err) {
    console.error("getPlanFeatures error:", err);
  }
  return result;
}
