// src/smartsocial/components/ImagePreview.tsx

import { useEffect, useState } from 'react';
import ScheduleModal from './ScheduleModal';
import { useToast } from './ui/use-toast';

export default function ImagePreview({
  prompt,
  enhancedPrompt,
  imageUrl,
  caption,
  hashtags,
  setImageUrl,
  setCaption,
  setHashtags,
  onBack,
  onPreviewConfirm,
  onGenerateImage,
  onRegenerateImage,
  userPlan = "free",
  regenerationCount = 0,
  loading = false,
}: {
  prompt: string;
  enhancedPrompt: string;
  imageUrl: string;
  caption: string;
  hashtags: string;
  setImageUrl: (url: string) => void;
  setCaption: (caption: string) => void;
  setHashtags: (tags: string) => void;
  onBack: () => void;
  onPreviewConfirm: () => void;
  onGenerateImage?: () => void;
  onRegenerateImage?: () => void;
  userPlan?: "free" | "pro";
  regenerationCount?: number;
  loading?: boolean;
}) {
  const { toast } = useToast();
  const hasImage = !!imageUrl;
  const canCreatePost = hasImage && caption;
  
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // Free tier limits tracking
  const [postsThisWeek, setPostsThisWeek] = useState(0);
  const canCreateFreePost = userPlan === "pro" || postsThisWeek < 2;
  const canUseAutoPilot = userPlan === "pro" || postsThisWeek < 2;

  // Load free tier usage on mount
  useEffect(() => {
    const storedPosts = localStorage.getItem('free_posts_this_week');
    const storedDate = localStorage.getItem('free_posts_reset_date');
    const today = new Date().toISOString().split('T')[0];
    
    if (storedDate !== today) {
      localStorage.setItem('free_posts_this_week', '0');
      localStorage.setItem('free_posts_reset_date', today);
      setPostsThisWeek(0);
    } else {
      setPostsThisWeek(parseInt(storedPosts || '0'));
    }
  }, []);

  // Handle post creation with free tier limits
  const handleCreatePost = () => {
    if (userPlan === "free" && !canCreateFreePost) {
      toast({
        title: "🎯 Upgrade to Pro",
        description: "You've used your 2 free posts this week. Upgrade for unlimited posts!",
        duration: 5000,
      });
      return;
    }
    
    if (userPlan === "free") {
      const newCount = postsThisWeek + 1;
      setPostsThisWeek(newCount);
      localStorage.setItem('free_posts_this_week', newCount.toString());
    }
    
    onPreviewConfirm();
  };

  // Handle schedule button click with tier checks
  const handleScheduleClick = () => {
    if (!canCreatePost) {
      toast({
        title: "Complete Your Post First",
        description: "Please generate an image and review your caption",
        variant: "destructive",
      });
      return;
    }
    
    if (userPlan === "free" && postsThisWeek >= 2) {
      // Show upgrade modal when limit reached
      toast({
        title: "🚫 Weekly Limit Reached",
        description: "You've used 2/2 AutoPilot schedules. Upgrade to Pro for unlimited!",
        variant: "destructive",
        duration: 6000,
      });
      return;
    }
    
    setIsScheduleModalOpen(true);
  };

  // Handle schedule completion
  const handleScheduleComplete = (scheduleData: any) => {
    console.log('📅 Post scheduled:', scheduleData);
    
    // Increment free tier usage
    if (userPlan === "free") {
      const newCount = postsThisWeek + 1;
      setPostsThisWeek(newCount);
      localStorage.setItem('free_posts_this_week', newCount.toString());
      
      toast({
        title: "📅 Post Timing Ready!",
        description: `Best time scheduled! You have ${2 - newCount} AutoPilot left this week.`,
        duration: 4000,
      });
    } else {
      toast({
        title: "🚀 Scheduled with AutoPilot!",
        description: `Post scheduled for ${scheduleData.schedule?.platforms?.length || 1} platform(s)`,
      });
    }
    
    setIsScheduleModalOpen(false);
  };

  // Handle free tier limit reached in modal
  const handleLimitReached = () => {
    toast({
      title: "🚀 Want More AutoPilot?",
      description: "Upgrade to Pro for unlimited AutoPilot scheduling",
      duration: 6000,
    });
  };

  // Handle regeneration with tier limits
  const handleRegenerateClick = () => {
    if (userPlan === "free" && regenerationCount >= 1) {
      toast({
        title: "🎨 Upgrade for More Creativity",
        description: "Free users get 1 regeneration. Upgrade to Pro for unlimited!",
        duration: 5000,
      });
      return;
    }
    
    if (onRegenerateImage) {
      onRegenerateImage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Free tier status banner */}
      {userPlan === "free" && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Free Plan: {postsThisWeek}/2 AutoPilot schedules this week
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {canUseAutoPilot 
                    ? `${2 - postsThisWeek} AutoPilot schedules remaining` 
                    : "Upgrade to Pro for unlimited AutoPilot"}
                </p>
              </div>
            </div>
            {!canUseAutoPilot && (
              <button
                onClick={() => toast({
                  title: "Upgrade to Pro",
                  description: "Unlimited AutoPilot scheduling",
                  duration: 4000,
                })}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Upgrade →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Image Section */}
      <div className="text-center">
        {hasImage ? (
          <div className="relative">
            <img 
              src={imageUrl} 
              alt="Generated" 
              className="rounded-lg shadow-md w-full max-w-md mx-auto"
            />
            {onRegenerateImage && (
              <div className="mt-4">
                <button
                  onClick={handleRegenerateClick}
                  disabled={loading || (userPlan === 'free' && regenerationCount >= 1)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    loading || (userPlan === 'free' && regenerationCount >= 1)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                  }`}
                >
                  {loading ? "🔄 Generating..." : "🎨 Regenerate Image"}
                  {userPlan === 'free' && !loading && (
                    <span className="text-xs ml-2">
                      ({1 - regenerationCount} left)
                    </span>
                  )}
                </button>
                {userPlan === 'free' && regenerationCount >= 1 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    🚀 <strong>Pro tip:</strong> Upgrade for unlimited regenerations
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Add an Image to Your Post
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Generate an AI image that matches your caption
              </p>
              {onGenerateImage && (
                <button
                  onClick={onGenerateImage}
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                  }`}
                >
                  {loading ? "🔄 Generating Image..." : "🎨 Generate Image"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg space-y-4">
        <div>
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Caption</h3>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{caption}</p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Hashtags</h3>
          <p className="text-gray-700 dark:text-gray-300">{hashtags}</p>
        </div>
      </div>

      {/* Updated Action Buttons with Tier Awareness */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          ← Back
        </button>
        
        <div className="flex gap-3">
          {/* Show Generate Image button if no image */}
          {!hasImage && onGenerateImage && (
            <button
              onClick={onGenerateImage}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
              }`}
            >
              {loading ? "Generating..." : "Generate Image First"}
            </button>
          )}
          
          {/* Schedule Post Button with Tier Check */}
          {hasImage && (
            <button 
              onClick={handleScheduleClick}
              disabled={!canCreatePost || loading || (userPlan === "free" && postsThisWeek >= 2)}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                !canCreatePost || loading || (userPlan === "free" && postsThisWeek >= 2)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : userPlan === "pro"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
              }`}
            >
              {userPlan === "pro" 
                ? "🤖 AutoPilot Schedule" 
                : postsThisWeek >= 2 
                ? "🚫 Limit Reached" 
                : `📅 AutoPilot (${2 - postsThisWeek} left)`}
            </button>
          )}
          
          {/* Create Post Button with Free Tier Limits */}
          <button
            onClick={handleCreatePost}
            disabled={!canCreatePost || loading || (userPlan === "free" && !canCreateFreePost)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              !canCreatePost || loading || (userPlan === "free" && !canCreateFreePost)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700"
            }`}
          >
            {loading ? "Publishing..." : 
             userPlan === "free" && !canCreateFreePost ? "Upgrade to Post" : 
             "Create Post"}
          </button>
        </div>
      </div>

      {/* Help Text */}
      {!hasImage && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            💡 <strong>Next step:</strong> Generate an image to complete your post. 
            Your caption and hashtags are ready!
          </p>
        </div>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleScheduleComplete}
        onLimitReached={handleLimitReached}
        postData={{
          imageUrl,
          caption,
          hashtags,
          prompt,
          enhancedPrompt
        }}
        userPlan={userPlan}
        postsThisWeek={postsThisWeek}
      />
    </div>
  );
}