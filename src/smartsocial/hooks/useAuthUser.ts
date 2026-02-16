// src/smartsocial/hooks/useAuthUser.ts


import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../utils/firebase";

// Improved useAuthUser
export function useAuthUser() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsub = onAuthStateChanged(auth, (usr) => {
        setUser(usr);
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error("🔥 Auth state error:", err);
        setError("Authentication error");
        setLoading(false);
      });
      
      return () => unsub();
    } catch (err) {
      setError("Failed to initialize auth");
      setLoading(false);
    }
  }, []);

  return { user, loading, error };
}