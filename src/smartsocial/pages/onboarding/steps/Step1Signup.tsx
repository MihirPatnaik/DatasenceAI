// src/smartsocial/pages/onboarding/steps/Step1Signup.tsx

import { ArrowRight, CheckCircle, Eye, EyeOff, Sparkles } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { handleEmailSignup, handleGoogleSignup } from "../../../utils/authService";
import { auth, db } from "../../../utils/firebase";
import { getRecaptchaToken } from "../../../utils/recaptchaService";
import { saveUserToFirestore } from "../../../utils/userService";
import { validateEmail } from "../../../utils/validation";

const Step1Signup: React.FC = () => {
  const navigate = useNavigate();

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"google" | "email" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showBusinessEmailField, setShowBusinessEmailField] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState(""); // Debug state

  // form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessEmail: "",
  });

  const emailInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ Check if user is returning (already has account)
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      
      if (user) {
        setDebugInfo(`Auto-detected user: ${user.email}`);
        console.log("🔄 Auto-detected user on page load:", user.email);
        
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("📊 Onboarding status on load:", userData.onboarding?.completed);
            
            if (userData.onboarding?.completed === true) {
              console.log("🚀 Auto-redirecting to home");
              navigate("/smartsocial/home", { replace: true });
            } else {
              console.log("⏸️ User detected but onboarding incomplete - staying on step1");
              // Don't redirect - let them complete onboarding
            }
          }
        } catch (err) {
          console.error("❌ Error checking user data:", err);
        }
      } else {
        setDebugInfo("No user detected - showing signup page");
        console.log("👤 No user detected - showing signup page");
      }
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // 🚀 ENHANCED Google signup flow with better timing
  const handleGoogle = async () => {
    setError(null);
    setIsLoading(true);
    setAuthMethod("google");

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken("google_signup");

      console.log("🔄 Starting Google signup...");
      
      // Pass token to Google signup
      const result = await handleGoogleSignup(recaptchaToken);
      
      console.log("✅ Google signup completed, waiting for auth state...");
      
      // ✅ CRITICAL: Wait for Firebase auth state to update
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const user = auth.currentUser;
      console.log("👤 Current user after wait:", user?.email);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          console.log("📄 User document exists:", userDoc.exists());
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("🎯 Onboarding completed status:", userData.onboarding?.completed);
            
            // ✅ EXISTING USER WITH COMPLETED ONBOARDING - GO DIRECTLY TO HOME
            if (userData.onboarding?.completed === true) {
              console.log("✅ Redirecting existing user to home");
              navigate("/smartsocial/home", { replace: true });
              return;
            }
            
            // ✅ EXISTING USER WITH INCOMPLETE ONBOARDING
            console.log("🔄 User needs to complete onboarding");
          }
          
          // ✅ NEW USER OR EXISTING WITH INCOMPLETE ONBOARDING
          const isBusinessEmail = result?.isBusinessEmail ?? false;
          console.log("📧 Business email check:", isBusinessEmail);

          if (!isBusinessEmail) {
            console.log("📝 Showing business email field");
            setShowBusinessEmailField(true);
          } else {
            console.log("➡️ Navigating to step 3");
            navigate("/smartsocial/onboarding/step3");
          }
          
        } catch (err) {
          console.error("❌ Error checking Firestore:", err);
          // Fallback to business email check
          const isBusinessEmail = result?.isBusinessEmail ?? false;
          if (!isBusinessEmail) {
            setShowBusinessEmailField(true);
          } else {
            navigate("/smartsocial/onboarding/step3");
          }
        }
      } else {
        console.error("❌ No user after Google signup");
        setError("Google signup failed. Please try again.");
      }
      
    } catch (err: any) {
      console.error("❌ Google signup failed:", err);
      setError(err?.message ? String(err.message) : "Google signup failed. Please try again.");
    } finally {
      setIsLoading(false);
      setAuthMethod(null);
    }
  };

  // ... REST OF YOUR CODE (email signup, business email handlers) REMAINS THE SAME
  // Email signup flow with reCAPTCHA
  const handleEmailSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setAuthMethod("email");

    if (!formData.email || !validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/\d/.test(formData.password)) {
      setError("Password must contain at least one number.");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(formData.password)) {
      setError("Password must contain at least one special character.");
      return;
    }

    setIsLoading(true);
    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken("email_signup");

      await handleEmailSignup(
        formData.email,
        formData.password,
        formData.name || "",
        formData.businessEmail || "",
        recaptchaToken // Pass the token
      );

      navigate("/smartsocial/onboarding/step3");
    } catch (err: any) {
      console.error("❌ Email signup failed:", err);
      const message = err?.message ?? "Email signup failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
      setAuthMethod(null);
    }
  };

  // Save business email (after Google sign-in with free domain)
  const handleBusinessEmailSubmit = async () => {
    setError(null);
    const email = formData.businessEmail?.trim();

    if (email && !validateEmail(email)) {
      setError("Please enter a valid business email.");
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user found. Please sign in again.");

      if (email) {
        await saveUserToFirestore(user.uid, { businessEmail: email });
      }

      navigate("/smartsocial/onboarding/step3");
    } catch (err: any) {
      console.error("❌ Failed to save business email:", err);
      setError(err?.message ? String(err.message) : "Failed to save business email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipBusinessEmail = () => {
    navigate("/smartsocial/onboarding/step3");
  };

  return (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800">
    {/* Debug Info */}
    {debugInfo && (
      <div className="fixed top-4 left-4 bg-yellow-100 border border-yellow-400 p-3 rounded-lg text-sm z-50">
        🐛 DEBUG: {debugInfo}
      </div>
    )}
    
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-95"></div>

    <div className="relative flex flex-col md:flex-row w-full max-w-5xl bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
      {/* Left Panel */}
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
            Transform Your Social Presence in Minutes
          </h2>

          <ul className="space-y-4">
            <li className="flex items-start space-x-3">
              <CheckCircle className="text-emerald-300 w-5 h-5 flex-shrink-0 mt-1" />
              <div>
                <span className="text-base font-semibold">AI-Powered Content Creation</span>
                <p className="text-indigo-100 mt-1 text-xs">Generate engaging posts in seconds with our advanced AI</p>
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <CheckCircle className="text-emerald-300 w-5 h-5 flex-shrink-0 mt-1" />
              <div>
                <span className="text-base font-semibold">Smart Scheduling</span>
                <p className="text-indigo-100 mt-1 text-xs">Optimize posting times for maximum engagement</p>
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <CheckCircle className="text-emerald-300 w-5 h-5 flex-shrink-0 mt-1" />
              <div>
                <span className="text-base font-semibold">Performance Analytics</span>
                <p className="text-indigo-100 mt-1 text-xs">Track and improve your social media performance</p>
              </div>
            </li>
          </ul>
          {/* In the testimonial section - */}
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

      {/* Right Panel - SIGNUP FORM */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center bg-gray-800">
        {showBusinessEmailField ? (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <h1 className="text-xl font-bold text-white">Add Your Business Email</h1>
              <p className="text-gray-300 mt-2 text-sm">For a better experience, add your work email (optional)</p>
            </div>

            <div>
              <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-300 mb-1.5">
                Business Email (Optional)
              </label>
              <input
                id="businessEmail"
                type="email"
                value={formData.businessEmail}
                onChange={handleInputChange}
                placeholder="your.name@company.com"
                className="w-full px-3 py-2.5 border rounded-lg border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 placeholder-gray-400 text-sm"
              />
            </div>

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <div className="flex space-x-3">
              <button
                onClick={handleSkipBusinessEmail}
                className="flex-1 py-2.5 px-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-all text-sm"
              >
                Skip
              </button>

              <button
                onClick={handleBusinessEmailSubmit}
                disabled={isLoading}
                className="flex-1 py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-70 text-sm"
              >
                {isLoading ? <div className="w-4 h-4 border-2 border-t-white rounded-full animate-spin mx-auto"></div> : "Save Email"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold text-white">Join SmartSocial</h1>
              <p className="text-gray-300 mt-1 text-xs">Create your account and start your AI-powered social media journey</p>
            </div>

            <div className="max-w-md mx-auto w-full space-y-4">
              <button
                onClick={handleGoogle}
                disabled={isLoading}
                aria-label="Sign up with Google"
                className="flex items-center justify-center w-full py-2.5 px-3 bg-gray-700 border border-gray-600 rounded-lg font-medium text-white shadow-sm hover:bg-gray-600 transition-all text-sm"
              >
                {isLoading && authMethod === "google" ? (
                  <div className="w-5 h-5 border-2 border-t-blue-400 rounded-full animate-spin mr-2"></div>
                ) : (
                  <img src="/smartsocial/avatars/google.svg" alt="Google logo" className="w-4 h-4 mr-2" />
                )}
                Continue with Google
              </button>

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <div className="relative flex items-center my-3">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-3 text-gray-400 text-xs">Or continue with</span>
                <div className="flex-grow border-t border-gray-600"></div>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1">Work Email</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.name@company.com"
                    className="w-full px-3 py-2.5 border rounded-lg border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 placeholder-gray-400 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      className="w-full px-3 py-2.5 border rounded-lg border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 pr-10 placeholder-gray-400 text-sm"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">At least 8 characters with uppercase, number & special character</p>
                </div>

                <button
                  onClick={handleEmailSubmit}
                  disabled={isLoading}
                  className="group flex items-center justify-center w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md transition hover:from-indigo-700 hover:to-purple-700 disabled:opacity-70 text-sm"
                >
                  {isLoading && authMethod === "email" ? (
                    <div className="w-4 h-4 border-2 border-t-white rounded-full animate-spin mr-1"></div>
                  ) : null}
                  Create Account
                  <ArrowRight className="ml-1 w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-center text-gray-400 text-xs mt-5">
              Already have an account?{" "}
              <Link to="/smartsocial/login" className="text-indigo-400 font-medium hover:underline">Sign in</Link>
            </p>

            <p className="text-center text-gray-500 text-xs mt-3">
              By continuing, you agree to our{" "}
              <a href="#" className="hover:underline text-gray-400">Terms of Service</a>{" "}
              and{" "}
              <a href="#" className="hover:underline text-gray-400">Privacy Policy</a>
            </p>
          </>
        )}
      </div>
    </div>
  </div>
);
};

export default Step1Signup;