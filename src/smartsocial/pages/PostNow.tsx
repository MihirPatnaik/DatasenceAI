// src/smartsocial/pages/PostNow.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EnhancedPostButton from "../components/EnhancedPostButton"; // 🆕 ADD THIS
import ImagePreview from "../components/ImagePreview";
import QuotaBar from "../components/QuotaBar";
import { useToast } from "../components/ui/use-toast";
import { useAuthUser } from "../hooks/useAuthUser";

export default function PostNow() {
  const { user, loading: authLoading } = useAuthUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const uid = user?.uid ?? null;

  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Mock user data (replace with actual user context)
  const [userPlan] = useState<"free" | "pro">("free");
  const [postsThisWeek] = useState(0);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  // Mock AI enhancement
  const handleEnhance = async () => {
    if (!prompt.trim()) {
      toast({ title: "⚠️ Please enter a prompt first." });
      return;
    }

    setLoading(true);
    try {
      // Mock enhancement
      setEnhancedPrompt(`Enhanced: ${prompt}`);
      setCaption(`AI-generated caption for: ${prompt}`);
      setHashtags("#AI #Generated #SocialMedia");
      
      toast({ title: "✅ Post content generated!" });
      handleNext();
    } catch (err) {
      toast({ title: "❌ Enhancement failed. Try again." });
    } finally {
      setLoading(false);
    }
  };

  // Handle scheduling
  const handleSchedule = (scheduleData: any) => {
    console.log('Schedule data:', scheduleData);
    toast({
      title: "📅 Redirecting to Scheduler",
      description: "Opening schedule options...",
    });
    // Navigate to scheduler or open schedule modal
    navigate("/smartsocial/scheduler");
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-gray-500">Loading workspace…</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-8">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= num 
                ? "bg-purple-600 text-white" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-500"
            }`}>
              {num}
            </div>
            {num < 3 && (
              <div className={`w-16 h-1 ${
                step > num ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Enter Idea */}
      {step === 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Enter Your Post Idea ✨
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Describe what you want to post about
              </p>
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Announcing our new product launch with exclusive early access...'"
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl h-40 resize-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            
            <div className="flex justify-between items-center">
              <p className={`text-sm ${
                prompt.length > 500 ? "text-red-500" : "text-gray-500"
              }`}>
                {prompt.length}/500 characters
              </p>
              {prompt.length > 0 && (
                <button
                  onClick={() => setPrompt("")}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={handleEnhance}
                disabled={loading || !prompt.trim()}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? "Generating..." : "✨ Generate Content"}
              </button>
            </div>
            
            {/* Quota Bar */}
            {uid && <QuotaBar userId={uid} />}
          </div>
        </div>
      )}

      {/* Step 2: Image Preview & Enhancement */}
      {step === 2 && (
        <div className="space-y-6">
          <ImagePreview
            prompt={prompt}
            enhancedPrompt={enhancedPrompt}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            setCaption={setCaption}
            setHashtags={setHashtags}
            onBack={handleBack}
            // These props might need to be adjusted based on your ImagePreview component
            caption={caption}
            hashtags={hashtags}
            onPreviewConfirm={handleNext}
            onGenerateImage={() => {
              // Mock image generation
              setImageUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d");
              toast({ title: "🖼️ Image added!" });
            }}
            onRegenerateImage={() => {
              // Mock regeneration
              setImageUrl("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d");
              toast({ title: "🔄 Image regenerated!" });
            }}
            userPlan={userPlan}
            regenerationCount={0}
            loading={false}
          />
          
          {/* Quota Bar */}
          {uid && <QuotaBar userId={uid} />}
          
          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!caption.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              Next → Preview
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Final Post Options with EnhancedPostButton */}
      {step === 3 && (
        <EnhancedPostButton
          imageUrl={imageUrl}
          caption={caption}
          hashtags={hashtags}
          prompt={prompt}
          enhancedPrompt={enhancedPrompt}
          userPlan={userPlan}
          postsThisWeek={postsThisWeek}
          onBack={handleBack}
          onSchedule={handleSchedule}
        />
      )}
    </div>
  );
}