// src/smartsocial/pages/SignInPage.tsx

import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/use-toast";
import { auth } from "../utils/firebase";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

    /**
   * 🚀 Handle Sign In
   */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "⚠️ Please enter both email and password" });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast({ title: "✅ Logged in successfully" });
      
      // ✅ Let useAuthGuard handle the routing based on onboarding status
      // The user will be automatically redirected by useAuthGuard in the background

    } catch (err: any) {
      console.error("❌ Sign-in failed:", err);
      toast({
        title: "❌ Login failed",
        description: err?.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-700">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          Welcome Back 👋
        </h1>

        <form onSubmit={handleSignIn} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="your.email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border rounded-lg border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 border rounded-lg border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none pr-10 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-60"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-t-white rounded-full animate-spin mr-2"></div>
            )}
            <LogIn className="w-4 h-4 mr-1" />
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* CTA - FIXED LINK */}
        <p className="text-center text-gray-400 text-xs mt-4">
          Don't have an account?{" "}
          <Link to="/smartsocial/onboarding/step1" className="text-indigo-400 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}