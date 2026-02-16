// src/smartsocial/pages/LoginPage.tsx

import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Eye, EyeOff, LogIn, Mail, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ REMOVED useSearchParams
import { useToast } from "../components/ui/use-toast";
import { handleGoogleSignup } from "../utils/authService";
import { auth, db } from "../utils/firebase";
import { getRecaptchaToken } from "../utils/recaptchaService";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Auto-redirect if user is already logged in + Check for sign-out
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("👤 User is logged in (login page).");
      // do NOT auto-redirect — you wanted manual sign-in stay on page
    }
  });

  // check sign-out flag once when component mounts
  const showSignOutToast = localStorage.getItem('showSignOutToast');
  if (showSignOutToast === 'true') {
    toast({ title: "👋 Signed out successfully", duration: 3000 });
    localStorage.removeItem('showSignOutToast');
  }

  return () => unsubscribe();
}, [toast]); // only toast in deps

  // 🚀 Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    setAuthMethod("google");

    try {
      console.log("🔍 DEBUG 1: Starting Google sign-in...");
      const recaptchaToken = await getRecaptchaToken("google_login");
      console.log("🔍 DEBUG 2: reCAPTCHA token received");

      console.log("🔍 DEBUG 3: Calling handleGoogleSignup...");
      const result = await handleGoogleSignup(recaptchaToken);
      console.log("🔍 DEBUG 4: handleGoogleSignup result:", result);
      
      console.log("🔍 DEBUG 5: Waiting for auth state...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const user = auth.currentUser;
      console.log("🔍 DEBUG 6: Current user after wait:", user?.email);
      
      if (user) {
        console.log("🔍 DEBUG 7: Checking Firestore for user:", user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        console.log("🔍 DEBUG 8: User document exists:", userDoc.exists());
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("🔍 DEBUG 9: Onboarding completed:", userData.onboarding?.completed);
          
          // Smart redirect based on onboarding status
          if (userData.onboarding?.completed) {
            console.log("✅ DEBUG 10: Redirecting to HOME");

            // ✅ REDUCED DURATION: From 3000ms to 2000ms
            toast({ title: "✅ Signed in successfully", duration: 2000 });
            setTimeout(() => {
              navigate("/smartsocial/home", { replace: true });
            }, 100);
          } else {
            console.log("🔄 DEBUG 10: Redirecting to onboarding step3");
            
            // ✅ REDUCED DURATION: From 3000ms to 2000ms
            toast({ title: "✅ Signed in successfully", duration: 2000 });
            setTimeout(() => {
              navigate("/smartsocial/onboarding/step3", { replace: true });
            }, 100);
          }
        } else {
          console.log("❌ DEBUG 11: No user document - redirecting to onboarding");
          // ✅ SHOW TOAST RIGHT BEFORE REDIRECT
          toast({ title: "✅ Signed in successfully", duration: 3000 });
          setTimeout(() => {
            navigate("/smartsocial/onboarding/step1", { replace: true });
          }, 100);
        }
      } else {
        console.error("❌ DEBUG 12: No user after Google sign-in");
        setError("Google sign-in failed. No user returned.");
      }
      
    } catch (err: any) {
      console.error("❌ Google sign-in failed:", err);
      console.error("❌ Full error details:", JSON.stringify(err, null, 2));
      setError(err?.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
      setAuthMethod(null);
    }
  };

  // 📧 Handle Email/Password Sign-In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setAuthMethod("email");

    try {
      // Sign in with email/password
      await signInWithEmailAndPassword(auth, email.trim(), password);
      
      console.log("🔍 DEBUG: Email login successful, checking onboarding status...");
      
      // Wait a moment for auth state to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = auth.currentUser;
      if (user) {
        console.log("🔍 DEBUG: Checking Firestore for user:", user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("🔍 DEBUG: Onboarding completed:", userData.onboarding?.completed);
          
          // Smart redirect based on onboarding status (same as Google flow)
          if (userData.onboarding?.completed) {
            console.log("✅ DEBUG: Redirecting to HOME");
            
            // ✅ REDUCED DURATION: From 3000ms to 2000ms
            toast({ title: "✅ Signed in successfully", duration: 2000 });
            setTimeout(() => {
              navigate("/smartsocial/home", { replace: true });
            }, 100);
          } else {
            console.log("🔄 DEBUG: Redirecting to onboarding step3");
            
            // ✅ REDUCED DURATION: From 3000ms to 2000ms
            toast({ title: "✅ Signed in successfully", duration: 2000 });
            setTimeout(() => {
              navigate("/smartsocial/onboarding/step3", { replace: true });
            }, 100);
          }
        } else {
          console.log("❌ DEBUG: No user document - redirecting to onboarding");
          
          // ✅ REDUCED DURATION: From 3000ms to 2000ms
          toast({ title: "✅ Signed in successfully", duration: 2000 });
          setTimeout(() => {
            navigate("/smartsocial/onboarding/step1", { replace: true });
          }, 100);
        }
      }
      
    } catch (err: any) {
      console.error("❌ Email sign-in failed:", err);
      
      // Enhanced error handling for email login
      let errorMessage = "Invalid email or password. Please try again.";
      
      if (err.code) {
        switch (err.code) {
          case "auth/user-not-found":
            errorMessage = "No account found with this email. Please sign up first.";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password. Please try again.";
            break;
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address.";
            break;
          case "auth/user-disabled":
            errorMessage = "This account has been disabled. Please contact support.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many failed attempts. Please try again later.";
            break;
          case "auth/network-request-failed":
            errorMessage = "Network error. Please check your connection.";
            break;
          default:
            errorMessage = err.message || "Sign-in failed. Please try again.";
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setAuthMethod(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-95"></div>

      <div className="relative flex flex-col md:flex-row w-full max-w-5xl bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
        
        {/* Left Panel - Branding */}
        <div className="hidden md:flex flex-1 flex-col justify-center items-start p-10 bg-gradient-to-br from-indigo-700 to-purple-800 text-white relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-600/10 rounded-full"></div>

          <div className="relative z-10">
            <div className="flex items-center mb-2">
              <Sparkles className="text-yellow-300 mr-2" size={24} />
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">
                SmartSocial
              </h1>
            </div>

            <h2 className="text-xl font-bold mb-6 mt-4 italic text-indigo-100">
              Welcome Back to Your AI Social Assistant
            </h2>

            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <span className="text-base font-semibold">AI-Powered Content</span>
                  <p className="text-indigo-100 mt-1 text-xs">Generate engaging posts in seconds</p>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <span className="text-base font-semibold">Smart Scheduling</span>
                  <p className="text-indigo-100 mt-1 text-xs">Optimize posting times automatically</p>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <span className="text-base font-semibold">Performance Analytics</span>
                  <p className="text-indigo-100 mt-1 text-xs">Track and improve your social media ROI</p>
                </div>
              </li>
            </ul>

            <div className="mt-8">
              <div className="flex -space-x-2">
                <img src="/smartsocial/avatars/user1.jpg" alt="User testimonial" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md" />
                <img src="/smartsocial/avatars/user2.jpg" alt="User testimonial" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md" />
                <img src="/smartsocial/avatars/user3.jpg" alt="User testimonial" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md" />
              </div>
              <p className="mt-2 text-indigo-200 text-xs">Trusted by 10,000+ marketers worldwide</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center bg-gray-800">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-gray-300 mt-2 text-sm">Sign in to your SmartSocial account</p>
          </div>

          <div className="max-w-md mx-auto w-full space-y-5">
            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex items-center justify-center w-full py-3 px-4 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {isLoading && authMethod === "google" ? (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
              ) : (
                <img src="/smartsocial/avatars/google.svg" alt="Google logo" className="w-5 h-5 mr-3" />
              )}
              Continue with Google
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <div className="relative flex items-center my-4">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">Or continue with email</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@company.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none pr-12 placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {isLoading && authMethod === "email" ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="text-center space-y-3 pt-4">
              <p className="text-gray-400 text-sm">
                Don't have an account?{" "}
                <Link to="/smartsocial/signup" className="text-indigo-400 font-medium hover:underline">
                  Create one now
                </Link>
              </p>
              
              <p className="text-gray-500 text-xs">
                By continuing, you agree to our{" "}
                <a href="#" className="hover:underline text-gray-400">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="hover:underline text-gray-400">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;