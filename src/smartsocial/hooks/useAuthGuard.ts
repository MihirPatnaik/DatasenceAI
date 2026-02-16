// src/smartsocial/hooks/useAuthGuard.ts


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById } from "../utils/userService";
import { useAuthUser } from "./useAuthUser";

/**
 * Protects routes — only allows logged-in users with completed onboarding.
 */
  export function useAuthGuard() {
  const { user, loading } = useAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    let isMounted = true;

    if (!user) {
      // ✅ Not logged in - redirect to signup (step1)
      isMounted && navigate("/smartsocial/onboarding/step1");
      return;
    }

    (async () => {
      try {
        const userDoc = await getUserById(user.uid);
        if (!isMounted) return;
        
        if (!userDoc) {
          // ✅ User auth exists but no Firestore doc - weird state, send to signup
          isMounted && navigate("/smartsocial/onboarding/step1");
        } else if (!userDoc.onboarding?.completed) {
          // ✅ User exists but onboarding not completed - continue onboarding
          // Don't redirect - let them continue from where they left
          console.log("🚦 User needs to complete onboarding");
        }
        // ✅ If completed, user stays on current page (like /home)
      } catch (err) {
        console.error("❌ AuthGuard Firestore check failed:", err);
        isMounted && navigate("/smartsocial/onboarding/step1");
      }
    })();

    return () => { isMounted = false; };
  }, [user, loading, navigate]);
}