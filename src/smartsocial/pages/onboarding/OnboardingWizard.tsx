// src/smartsocial/pages/onboarding/OnboardingWizard.tsx

import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { auth, db } from "../../utils/firebase";

const steps = [
  { title: "Welcome", content: "Let's get started with SmartSocial AI 🚀" },
  { title: "Profile Setup", content: "Tell us about your business/brand." },
  { title: "Preferences", content: "Choose your AI assistant settings." },
  { title: "Ready!", content: "You're all set 🎉" },
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboarding = async () => {
      const user = auth.currentUser;
      
      // ✅ If no user, redirect to LOGIN
      if (!user) {
        navigate("/smartsocial/login", { replace: true });
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        // ✅ If onboarding already completed, go to DASHBOARD (not home)
        if (snap.exists() && snap.data()?.onboarding?.completed === true) {
          navigate("/smartsocial/dashboard", { replace: true }); // ✅ UPDATED PATH
          return;
        }
      } catch (err) {
        console.error("❌ OnboardingWizard: Error checking user data:", err);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [navigate]);

  const nextStep = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          await setDoc(
            userRef,
            { 
              onboarding: { 
                completed: true,
                celebrated: true,
                completedAt: new Date() // ✅ ADDED: Track completion timestamp
              } 
            },
            { merge: true }
          );
        } catch (err) {
          console.error("❌ Failed to update onboarding status:", err);
        }
      }

      setCompleted(true);
      setTimeout(() => {
        navigate("/smartsocial/dashboard", { replace: true }); // ✅ UPDATED PATH
      }, 2000);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your onboarding status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-gray-200"
      >
        {!completed ? (
          <>
            {/* Progress indicator */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-medium text-purple-600">
                Step {step + 1} of {steps.length}
              </span>
              <button
                onClick={() => navigate("/smartsocial/dashboard")}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip onboarding
              </button>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {steps[step].title}
            </h2>
            <p className="mb-8 text-gray-600 text-lg leading-relaxed">
              {steps[step].content}
            </p>

            {/* Progress bar */}
            <div className="mb-6">
              <ProgressBar
                currentStep={step + 1}
                totalSteps={steps.length}
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex space-x-3">
              {step > 0 && (
                <button
                  onClick={prevStep}
                  className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={nextStep}
                className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 ${
                  step > 0 ? 'flex-1' : 'w-full'
                }`}
              >
                {step === steps.length - 1 ? "🎉 Complete Setup" : "Continue →"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg"
            >
              <span className="text-3xl text-white">✓</span>
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Welcome to SmartSocial! 🎉
            </h2>
            <p className="text-gray-600 mb-2 text-lg">
              Your onboarding is complete
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Redirecting to your dashboard...
            </p>
            
            <div className="w-full mb-6">
              <ProgressBar currentStep={steps.length} totalSteps={steps.length} />
            </div>

            {/* Loading animation */}
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </motion.div>

      {/* Brand footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Powered by <span className="font-semibold text-purple-600">SmartSocial AI</span>
        </p>
      </div>
    </div>
  );
}