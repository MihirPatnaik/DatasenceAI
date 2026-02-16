// src/components/AdminRoute.tsx

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../smartsocial/utils/firebase";
import { onAuthStateChanged, getIdTokenResult, User } from "firebase/auth";
import { Loader2 } from "lucide-react";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u: User | null) => {
      setUser(u);

      if (!u) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // ✅ Always refresh claims on login
        const tokenResult = await getIdTokenResult(u, true);
        setIsAdmin(!!tokenResult.claims.admin);
      } catch (err) {
        console.error("Admin claim check failed:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-6 w-6 text-blue-500 mr-2" />
        <span>Verifying admin access…</span>
      </div>
    );
  }

  if (!user) {
    // ❌ Not logged in → send to sign-in
    return <Navigate to="/smartsocial/signin" replace />;
  }

  if (!isAdmin) {
    // Logged in but not admin → normal home
    return <Navigate to="/smartsocial/home" replace />;
  }

  // ✅ Admin confirmed
  return children;
}
