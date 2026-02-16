// src/smartsocial/pages/smartsocialHome.tsx

import confetti from "canvas-confetti";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthGuard } from "../hooks/useAuthGuard";
import { useAuthUser } from "../hooks/useAuthUser";
import { usePreload } from "../hooks/usePreload";
import { useTheme } from "../hooks/useTheme";

import { callImageAgent } from "../agents/imageAgents";
import { buildSocialPost } from "../server/agents/promptEngine";
import { enhancePrompt } from "../server/agents/promptEnhancerAgent";

import Header from "../components/Header";
import ImageFirstFlow from "../components/ImageFirstFlow";
import ScheduleModal from "../components/ScheduleModal"; // 🆕 ADD IMPORT
import TextFirstFlow from "../components/TextFirstFlow";
import { useToast } from "../components/ui/use-toast";

import { clearImageCache } from "../agents/imageAgents";
import EnhancedPostButton from "../components/EnhancedPostButton"; // 🆕 ADD THIS
import QuotaBar from "../components/QuotaBar";
import { db } from "../utils/firebase";
import { UserContextData } from "../utils/userContext";



export default function SmartSocialPage() {
  useAuthGuard();
  usePreload();
  
  const { toast } = useToast();
  const { user, loading: userLoading } = useAuthUser();
  const { isDarkTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const userId = user?.uid || null;

  // Reset scroll on page load
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
  }, []);

  // 🔹 UI states
  const [creationPath, setCreationPath] = useState<"image" | "text" | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [step, setStep] = useState<"choice" | "input" | "preview">("choice");
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");
  const [isGenerating, setIsGenerating] = useState(false);
  const [postContext, setPostContext] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // 🆕 ADD MISSING STATE VARIABLES
  const [imageRegenerationCount, setImageRegenerationCount] = useState(0);

  // 🆕 ADD SCHEDULE MODAL STATE
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // 🧠 Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data() as UserContextData;
          setUserPlan(data.onboarding?.plan || "free");
        }
      } catch (err) {
        console.error("❌ Failed to load user data:", err);
      }
    };

    loadUserData();
  }, [user]);

  // 🎉 Confetti on first complete onboarding
  useEffect(() => {
    if (!user || userLoading) return;

    const runConfettiCheck = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) return;

        const data = snap.data() as UserContextData;
        if (data.onboarding?.completed && !data.onboarding?.celebrated) {
          confetti({ particleCount: 600, spread: 160, origin: { y: 0.6 } });
          setTimeout(() => confetti({ particleCount: 400, spread: 200, origin: { y: 0.4 } }), 1000);
          setTimeout(() => confetti({ particleCount: 300, spread: 180, origin: { y: 0.7 } }), 2000);
          await updateDoc(userRef, { "onboarding.celebrated": true });
        }
      } catch (err) {
        console.error("❌ Confetti Firestore check failed:", err);
      }
    };

    runConfettiCheck();
  }, [user, userLoading]);

  // 💡 Tooltip
  useEffect(() => {
    if (!user || userLoading) return;

    const runTooltipCheck = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) return;

        const data = snap.data() as UserContextData;
        if (data.onboarding?.completed && !data.firstTooltipShown) {
          setShowTooltip(true);
          const timer = setTimeout(async () => {
            setShowTooltip(false);
            await updateDoc(userRef, { firstTooltipShown: true });
          }, 5000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("❌ Tooltip Firestore check failed:", err);
      }
    };

    runTooltipCheck();
  }, [user, userLoading]);

  // 🔄 Reset UI
  const handleReset = () => {
    setUserPrompt("");
    setEnhancedPrompt("");
    setImageUrl(null);
    setCaption("");
    setHashtags("");
    setStep("choice");
    setCreationPath(null);
    setPostContext("");
    setImageRegenerationCount(0); // 🆕 Reset regeneration count
    setIsScheduleModalOpen(false); // 🆕 Reset schedule modal
  };

  // ✨ Enhance prompt + build post (text path)
  const handleEnhance = async () => {
    if (!userPrompt.trim()) {
      toast({ title: "⚠️ Please enter a prompt first." });
      return;
    }
    if (!userId) {
      toast({ title: "⚠️ Please log in to generate posts." });
      return;
    }

    setLoading(true);
    setIsGenerating(true);
    try {
      const result = await enhancePrompt(userPrompt);
      setEnhancedPrompt(result.prompt);

      const aiPost = await buildSocialPost(
        userPrompt,
        {
          industry: "General",
          campaignType: "Social Media Post",
          tone: "Engaging & Authentic",
        },
        "caption",
        userId
      );

      setCaption(aiPost.caption);
      setHashtags(aiPost.hashtags);
      
      toast({ title: "✅ Post content generated successfully!" });
      setStep("preview");
    } catch (err) {
      console.error("❌ Enhancement failed:", err);
      toast({ title: "❌ Enhancement failed. Try again." });
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  // 🆕 GENERATE IMAGE FIRST TIME
  const handleGenerateFirstImage = async () => {
    if (!enhancedPrompt.trim()) {
      toast({ title: "⚠️ Please refine your post first." });
      return;
    }
    
    await handleGenerateImage(false); // false = not a regeneration
  };

  // Handle image-first generation
  const handleImageFirstGenerate = async () => {
    if (!imageUrl) {
      toast({ title: "⚠️ Please upload an image first." });
      return;
    }
    if (!userId) {
      toast({ title: "⚠️ Please log in to generate posts." });
      return;
    }

    setLoading(true);
    setIsGenerating(true);
    try {
      const context = postContext.trim() || "Create an engaging social media post for this image";
      
      const aiPost = await buildSocialPost(
        context,
        {
          industry: "General",
          campaignType: "Social Media Post",
          tone: "Engaging & Authentic",
        },
        "caption",
        userId
      );

      setCaption(aiPost.caption);
      setHashtags(aiPost.hashtags);
      setUserPrompt(context);
      
      toast({ title: "✅ Post generated for your image!" });
      setStep("preview");
    } catch (err) {
      console.error("❌ Image post generation failed:", err);
      toast({ title: "❌ Failed to generate post. Try again." });
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  // 🖼️ Generate AI image (UPDATED WITH REGENERATION PARAMETER AND CACHE BYPASS)
  const handleGenerateImage = async (isRegeneration: boolean = false) => {
    // 🆕 PREVENT RAPID MULTIPLE CALLS
    if (isGeneratingImage) {
      console.log("⏳ Image generation already in progress, please wait...");
      return;
    }

    if (!enhancedPrompt.trim()) {
      toast({ title: "⚠️ Please refine your post first." });
      return;
    }
    
    // 🆕 CHECK REGENERATION LIMITS FOR FREE USERS
    if (isRegeneration && userPlan === 'free' && imageRegenerationCount >= 1) {
      toast({
        title: "🎁 Upgrade to Pro",
        description: "Free users get one image regeneration. Upgrade for unlimited creations!",
        duration: 5000,
      });
      return;
    }

    setIsGeneratingImage(true);
    setLoading(true);
    
    try {
      // 🆕 DEMO MODE: Pass bypassCache=true during demo to get fresh images
      // ⬇️⬇️⬇️ CHANGE TO true DURING DEMO ⬇️⬇️⬇️
      const bypassCache = true; // Set to true during demo, false after demo
      // ⬆️⬆️⬆️ CHANGE BACK TO false AFTER DEMO ⬆️⬆️⬆️
      
      const preview = await callImageAgent(
        enhancedPrompt, 
        "512x512", 
        userId || undefined,
        toast,
        bypassCache // 🆕 DEMO: This will bypass cache when true
      );
      
      if (preview.imageUrl) {
        setImageUrl(preview.imageUrl);
        
        if (isRegeneration) {
          setImageRegenerationCount(prev => prev + 1);
          toast({ 
            title: "🔄 Image Regenerated!", 
            description: userPlan === 'free' 
              ? `${1 - imageRegenerationCount} regenerations left` 
              : "Unlimited regenerations with Pro!"
          });
        } else {
          toast({ title: "🖼️ Image generated successfully!" });
        }
      } else {
        toast({ 
          title: "❌ Image generation failed", 
          description: preview.message || "Please try again",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("❌ Image generation failed:", err);
      toast({ title: "❌ Image generation failed. Try again." });
    } finally {
      setLoading(false);
      setIsGeneratingImage(false);
    }
  };

  // 🆕 HANDLE SCHEDULE COMPLETION
  const handleScheduleComplete = (scheduleData: any) => {
    console.log('📅 Post scheduled:', scheduleData);
    toast({
      title: "✅ Post Scheduled!",
      description: `Post scheduled for ${scheduleData.platforms.length} platform(s)`,
    });
    setIsScheduleModalOpen(false);
    
    // Optionally reset and navigate after scheduling
    setTimeout(() => {
      handleReset();
      navigate("/smartsocial/dashboard");
    }, 1500);
  };

  // ✅ Preview confirm - UPDATED TO OPEN SCHEDULE MODAL
  const handlePreviewConfirm = () => {
  if (!caption || !imageUrl) {
    toast({ title: "⚠️ Generate an image & caption first." });
    return;
  }
  
  // Instant publishing logic here
  toast({ 
    title: "🎉 Post Published!", 
    description: "Your post has been published successfully.",
    duration: 3000 
  });

    // Then navigate to dashboard
  setTimeout(() => {
    handleReset();
    navigate("/smartsocial/dashboard");
  }, 2000);
};

  // 🚧 Loading state
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Session Expired</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Please log in to access your workspace.</p>
          <button
            onClick={() => navigate("/smartsocial/login")}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header 
        userPlan={userPlan}
        currentPage="Create Post"
        onThemeToggle={toggleTheme}
        isDarkTheme={isDarkTheme}
        showSignOut={false}
      />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-24">
        {/* 🧹 TEMPORARY CACHE CLEAR BUTTON - REMOVE IN PRODUCTION */}
        {import.meta.env.DEV && (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={() => {
          clearImageCache();
          toast({ title: "🧹 Cache cleared", duration: 2000 });
        }}
        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg text-sm font-medium transition-colors"
        title="Clear image cache (Dev only)"
      >
        🧹 Clear Cache
      </button>
    </div>
  )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 transition-colors duration-300">
          
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
            >
              Create Your Next Post
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 dark:text-gray-300"
            >
              Transform your ideas into engaging social media content with AI
            </motion.p>
          </div>

          {/* Dual Path Choice */}
          <AnimatePresence mode="wait">
            {step === "choice" && (
              <motion.div
                key="choice-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Path Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image First Path */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCreationPath("image");
                      setStep("input");
                    }}
                    className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 cursor-pointer transition-all hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🖼️</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        I Have an Image
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        Upload your photo and we'll create the perfect caption
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div>📱 JPG, PNG, WebP</div>
                        <div>⚡ Max 10MB</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Text First Path */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCreationPath("text");
                      setStep("input");
                    }}
                    className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 cursor-pointer transition-all hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">💬</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        I Have an Idea
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        Describe your post and we'll generate content + image
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div>✨ AI Caption + Hashtags</div>
                        <div>🎨 Optional AI Image</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Usage Overview */}
                {userId && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Usage Overview</h3>
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                        {userPlan === "free" ? "Free Plan" : "Pro Plan"}
                      </span>
                    </div>
                    <QuotaBar userId={userId} compact />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Input Step - For Both Paths */}
            {step === "input" && (
              <motion.div
                key="input-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Back Button */}
                <button
                  onClick={() => {
                    setStep("choice");
                    setCreationPath(null);
                    handleReset();
                  }}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  ← Back to Options
                </button>

                {/* Conditional Input Based on Path */}
                {creationPath === "image" ? (
                  <ImageFirstFlow 
                    imageUrl={imageUrl}
                    setImageUrl={setImageUrl}
                    postContext={postContext}
                    setPostContext={setPostContext}
                    onGenerate={handleImageFirstGenerate}
                    loading={loading}
                  />
                ) : (
                  <TextFirstFlow 
                    userPrompt={userPrompt}
                    setUserPrompt={setUserPrompt}
                    onGenerate={handleEnhance}
                    loading={loading}
                  />
                )}
              </motion.div>
            )}

          {/* Preview Step */}
          {step === "preview" && (
            <motion.div
              key="preview-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* ImagePreview but WITHOUT the final post buttons */}
              <ImagePreview
                prompt={userPrompt}
                enhancedPrompt={enhancedPrompt}
                imageUrl={imageUrl || ""}
                caption={caption}
                hashtags={hashtags}
                setImageUrl={(url) => setImageUrl(url || null)}
                setCaption={setCaption}
                setHashtags={setHashtags}
                onBack={handleReset}
                onPreviewConfirm={() => {}} // Empty function - don't use this
                onGenerateImage={handleGenerateFirstImage}
                onRegenerateImage={() => handleGenerateImage(true)}
                userPlan={userPlan}
                regenerationCount={imageRegenerationCount}
                loading={loading}
              />
              
              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReset}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  ← Back to Start
                </button>
                <button
                  onClick={() => setStep(4)} // Go to final step
                  disabled={!caption.trim() || !imageUrl}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
                >
                  Next → Finalize Post
                </button>
              </div>
            </motion.div>
          )}

          {/* NEW: Step 4 - Final Post Options */}
          {step === 4 && (
            <motion.div
              key="final-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <EnhancedPostButton
                imageUrl={imageUrl || ""}
                caption={caption}
                hashtags={hashtags}
                prompt={userPrompt}
                enhancedPrompt={enhancedPrompt}
                userPlan={userPlan}
                postsThisWeek={0}
                onBack={() => setStep(3)} // Go back to preview
                onSchedule={() => setIsScheduleModalOpen(true)}
              />
            </motion.div>
          )}
          </AnimatePresence>

          {/* 💡 Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm flex items-center space-x-3 z-50 max-w-sm"
              >
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span>💡</span>
                </div>
                <span className="flex-1">Your turn! Tell me what you want to post...</span>
                <button
                  onClick={() => setShowTooltip(false)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              <span className="font-semibold text-gray-900 dark:text-white">Free plan:</span> 5 posts per week •{" "}
              <button 
                onClick={() => navigate("/smartsocial/planadmin/pro")}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors"
              >
                Upgrade to Pro
              </button>{" "}
              for unlimited posts and premium features
            </p>
          </div>
        </motion.footer>
      </main>

      {/* 🆕 SCHEDULE MODAL */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleScheduleComplete}
        userPlan={userPlan} // ✅ ADDED THIS PROP
        postData={{
          imageUrl: imageUrl || "",
          caption,
          hashtags,
          prompt: userPrompt,
          enhancedPrompt
        }}
      />
    </div>
  );
}