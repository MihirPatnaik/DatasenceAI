//src/smartsocial/pages/admin/SignIn.tsx

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
} from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../../utils/firebase";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Force refresh ID token before redirect
  const handleRedirect = async (user: User) => {
    try {
      await user.getIdToken(true); // 👈 force refresh
      const idTokenResult = await user.getIdTokenResult();

      if (idTokenResult.claims.admin) {
        console.log("✅ Admin user detected:", user.email);
        navigate("/smartsocial/admin");
      } else {
        console.log("ℹ️ Normal user detected:", user.email);
        navigate("/smartsocial/dashboard");
      }
    } catch (err) {
      console.error("❌ Token refresh/claim check failed:", err);
      setError("Could not verify permissions. Try again.");
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await handleRedirect(cred.user);
    } catch (err: any) {
      console.error("Email Sign-In error:", err);
      setError(`Firebase: ${err.code || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, provider);
      await handleRedirect(cred.user);
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      setError(`Firebase: ${err.code || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Email/Password Sign-In */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">or</div>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mt-4 bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
