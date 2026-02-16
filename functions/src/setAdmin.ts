// functions/src/setAdmin.ts

import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";

// Ensure Admin SDK is initialized (safe check)
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Callable function: setAdminClaim
 * Allows an existing admin to promote another user by email.
 * Usage from frontend:
 *   const promote = httpsCallable(functions, "setAdminClaim");
 *   await promote({ email: "new.admin@example.com" });
 */
export const setAdminClaim = onCall(async (request) => {
  // 🔐 Require caller to already be an admin
  if (!request.auth?.token?.admin) {
    throw new HttpsError(
      "permission-denied",
      "Only admins can promote other users to admin."
    );
  }

  const { email } = request.data || {};
  if (!email || typeof email !== "string") {
    throw new HttpsError("invalid-argument", "A valid email is required.");
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    return {
      success: true,
      message: `${email} is now an admin.`,
      uid: user.uid,
    };
  } catch (err: any) {
    console.error("❌ Error setting admin claim:", err);
    throw new HttpsError("internal", err.message || "Failed to set admin claim");
  }
});

/**
 * Optional: removeAdminClaim
 * Lets an admin demote another user (remove admin rights).
 */
export const removeAdminClaim = onCall(async (request) => {
  if (!request.auth?.token?.admin) {
    throw new HttpsError("permission-denied", "Only admins can revoke admin.");
  }

  const { email } = request.data || {};
  if (!email || typeof email !== "string") {
    throw new HttpsError("invalid-argument", "A valid email is required.");
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, {}); // clears admin
    return {
      success: true,
      message: `${email} is no longer an admin.`,
      uid: user.uid,
    };
  } catch (err: any) {
    console.error("❌ Error removing admin claim:", err);
    throw new HttpsError("internal", err.message || "Failed to remove admin claim");
  }
});
