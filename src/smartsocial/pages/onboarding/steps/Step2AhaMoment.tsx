// src/smartsocial/pages/onboarding/steps/Step2AhaMoment.tsx

import { doc, setDoc, updateDoc } from "firebase/firestore";
import { Heart, MessageCircle, Share2, Sparkles } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { callImageAgent } from "../../../agents/imageAgents";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { buildSocialPost } from "../../../server/agents/promptEngine";
import { auth, db } from "../../../utils/firebase";
import { getUserById } from "../../../utils/userService";

// Define proper TypeScript interfaces
interface OnboardingData {
  businessName?: string;
  industry?: string;
  campaignType?: string;
  brandVibe?: string;
}

interface UserData {
  onboarding?: OnboardingData;
}

const Step2AhaMoment: React.FC = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [surveyChoice, setSurveyChoice] = useState<
    "love" | "ok" | "needswork" | null
  >(null);
  const [suggestion, setSuggestion] = useState("");
  const [isFeedbackHighlighted, setIsFeedbackHighlighted] = useState(false);
  const feedbackRef = useRef<HTMLTextAreaElement | null>(null);
  const feedbackContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const runAhaMoment = async () => {
      if (!auth.currentUser) return;
      try {
        const user = await getUserById(auth.currentUser.uid) as UserData;
        if (!user || !user.onboarding) {
          console.error("❌ No user or onboarding data found");
          setLoading(false);
          return;
        }

        // Safe access with fallbacks
        const businessName = user.onboarding.businessName || "your business";
        const industry = user.onboarding.industry || "your industry";

        const examplePrompt = `Grand opening for ${businessName}, a ${industry} company!`;

        const socialPost = await buildSocialPost(
          examplePrompt,
          {
            industry: industry,
            campaignType: user.onboarding.campaignType || "launch",
            tone: user.onboarding.brandVibe || "friendly",
          },
          "caption",
          auth.currentUser.uid
        );

        setCaption(socialPost.caption);
        setHashtags(socialPost.hashtags);

        const { imageUrl } = await callImageAgent(examplePrompt, "512x512");
        setImageUrl(imageUrl);
      } catch (err) {
        console.error("❌ AhaMoment error:", err);
      } finally {
        setLoading(false);
      }
    };

    runAhaMoment();
  }, []);

  // Function to navigate to Step4PlanSelector
  const navigateToStep4 = () => {
    console.log("🚀 Navigating to Step 4");
    navigate("../onboarding/step4");
    window.scrollTo(0, 0);
  };

  const handleSurvey = async (choice: "love" | "ok" | "needswork") => {
    console.log(`📊 Survey choice: ${choice}`);
    setSurveyChoice(choice);

    if (choice === "needswork") {
      // Set highlighted state and focus with animation
      setIsFeedbackHighlighted(true);
      
      setTimeout(() => {
        feedbackRef.current?.focus();
        
        // Add pulsing animation effect
        if (feedbackContainerRef.current) {
          feedbackContainerRef.current.classList.add("animate-pulse");
          setTimeout(() => {
            feedbackContainerRef.current?.classList.remove("animate-pulse");
          }, 2000);
        }
      }, 100);
      return;
    }

    // For "love" and "ok" choices, navigate directly to Step4PlanSelector
    if (!auth.currentUser) {
      console.log("❌ No authenticated user, navigating directly");
      navigateToStep4();
      return;
    }
    
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);

      // Try to update Firestore, but don't block navigation if it fails
      await updateDoc(userRef, {
        "onboarding.progress": 4, // Progress to step 4 (Plan Selector)
        "onboarding.completed": false,
      }).catch(error => {
        console.warn("⚠️ Could not update progress in Firestore:", error);
        // Continue navigation anyway
      });

      await setDoc(
        doc(db, "users", auth.currentUser.uid, "feedback", "ahaMoment"),
        {
          choice,
          suggestion: "",
          createdAt: new Date(),
        },
        { merge: true }
      ).catch(error => {
        console.warn("⚠️ Could not save feedback in Firestore:", error);
        // Continue navigation anyway
      });

      console.log("✅ Survey response saved, navigating to step 4");
    } catch (error) {
      console.error("❌ Error in survey handling:", error);
    } finally {
      // Always navigate, regardless of Firestore success/failure
      navigateToStep4();
    }
  };

  const handleContinueAfterSuggestion = async () => {
    console.log("📝 Submitting feedback and continuing");
    
    if (!auth.currentUser) {
      console.log("❌ No authenticated user, navigating directly");
      navigateToStep4();
      return;
    }

    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        "onboarding.progress": 4, // Progress to step 4 (Plan Selector)
        "onboarding.completed": false,
      }).catch(error => {
        console.warn("⚠️ Could not update progress in Firestore:", error);
        // Continue navigation anyway
      });

      await setDoc(
        doc(db, "users", auth.currentUser.uid, "feedback", "ahaMoment"),
        {
          choice: "needswork",
          suggestion,
          createdAt: new Date(),
        },
        { merge: true }
      ).catch(error => {
        console.warn("⚠️ Could not save feedback in Firestore:", error);
        // Continue navigation anyway
      });

      console.log("✅ Feedback saved, navigating to step 4");
    } catch (error) {
      console.error("❌ Error in feedback handling:", error);
    } finally {
      // Always navigate, regardless of Firestore success/failure
      navigateToStep4();
    }
  };

  // Add keyboard shortcut for Enter key in textarea
  const handleTextareaKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && suggestion.trim()) {
      handleContinueAfterSuggestion();
    }
  };

  // Remove highlight when user starts typing
  const handleTextareaFocus = () => {
    setIsFeedbackHighlighted(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-700">
        <ProgressBar currentStep={2} totalSteps={4} percentage={50} />

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Your AI-Powered Post is Ready!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This is what SmartSocial can create for your business
          </p>
        </div>

        {loading ? (
          // Skeleton loader
          <div className="border rounded-xl shadow-lg overflow-hidden mb-6 p-4 animate-pulse dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
              </div>
            </div>
            <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ) : (
          <>
            {/* Social post preview */}
            <div className="border rounded-xl shadow-lg overflow-hidden mb-6 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-700">
              <div className="flex items-center px-4 py-3 bg-white dark:bg-gray-800">
                <img
                  src="https://i.pravatar.cc/40"
                  alt="profile"
                  className="w-10 h-10 rounded-full mr-3 border-2 border-white dark:border-gray-700 shadow-sm"
                />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    SmartSocial AI
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Just now
                  </p>
                </div>
              </div>

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Generated"
                  className="w-full h-64 object-cover"
                />
              )}

              <div className="px-4 py-3 bg-white dark:bg-gray-800">
                <p className="text-gray-800 dark:text-gray-100 mb-2">
                  {caption}
                </p>
                <p className="text-blue-500 dark:text-blue-400 text-sm">
                  {hashtags}
                </p>
              </div>

              <div className="flex justify-around px-4 py-3 border-t bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                <button className="flex items-center space-x-1 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30">
                  <Heart size={18} /> <span className="text-sm">Like</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  <MessageCircle size={18} />{" "}
                  <span className="text-sm">Comment</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-green-500 transition-colors p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30">
                  <Share2 size={18} /> <span className="text-sm">Share</span>
                </button>
              </div>
            </div>

            {/* Survey */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-4">
              <h3 className="text-lg font-semibold text-center mb-4 text-gray-800 dark:text-gray-100">
                How do you feel about this AI-generated post?
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSurvey("love")}
                  className={`p-3 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 bg-pink-500 hover:bg-pink-600 ${
                    surveyChoice === "love" ? "ring-4 ring-pink-200 scale-105" : ""
                  }`}
                >
                  <span className="text-xl block mb-1">😍</span>
                  <span className="text-sm">Love it!</span>
                </button>
                <button
                  onClick={() => handleSurvey("ok")}
                  className={`p-3 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 bg-blue-500 hover:bg-blue-600 ${
                    surveyChoice === "ok" ? "ring-4 ring-blue-200 scale-105" : ""
                  }`}
                >
                  <span className="text-xl block mb-1">🙂</span>
                  <span className="text-sm">It's okay</span>
                </button>
                <button
                  onClick={() => handleSurvey("needswork")}
                  className={`p-3 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 bg-amber-500 hover:bg-amber-600 ${
                    surveyChoice === "needswork" ? "ring-4 ring-amber-200 scale-105" : ""
                  }`}
                >
                  <span className="text-xl block mb-1">😕</span>
                  <span className="text-sm">Needs work</span>
                </button>
              </div>
            </div>

            {/* Feedback form - Enhanced with dramatic 3D effect */}
            {surveyChoice === "needswork" && (
              <div 
                ref={feedbackContainerRef}
                className={`p-4 rounded-xl border-2 transition-all duration-500 transform ${
                  isFeedbackHighlighted 
                    ? "bg-gradient-to-br from-yellow-50 to-pink-50 dark:from-yellow-900/30 dark:to-pink-900/30 border-yellow-400 dark:border-pink-400 shadow-2xl scale-105 ring-4 ring-yellow-200 dark:ring-pink-900" 
                    : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-500 shadow-lg"
                }`}
              >
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-3">
                  What can we improve?
                </h4>
                <textarea
                  ref={feedbackRef}
                  placeholder="Your feedback helps us create better content for you..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  onKeyPress={handleTextareaKeyPress}
                  onFocus={handleTextareaFocus}
                  className={`w-full p-3 border rounded-lg mb-3 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-800 dark:text-gray-100 transition-all duration-300 ${
                    isFeedbackHighlighted 
                      ? "border-yellow-400 dark:border-pink-400 ring-2 ring-yellow-300 dark:ring-pink-300" 
                      : "border-yellow-300 dark:border-yellow-500"
                  }`}
                  rows={3}
                  autoFocus
                />
                <button
                    onClick={handleContinueAfterSuggestion}
                    disabled={!suggestion.trim()}
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      suggestion.trim()
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                        : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Submit & Continue →
                  </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Step2AhaMoment;