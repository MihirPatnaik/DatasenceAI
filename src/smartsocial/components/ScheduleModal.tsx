// src/smartsocial/components/ScheduleModal.tsx

import React, { useState } from 'react';
import { useUserContext } from '../hooks/useUserContext';
import { saveScheduledPost } from '../utils/storage';
import { useToast } from './ui/use-toast';

interface ScheduleData {
  id: string;
  userId: string;
  postData: {
    imageUrl: string;
    caption: string;
    hashtags: string;
    prompt: string;
    enhancedPrompt: string;
  };
  schedule: {
    platforms: string[];
    scheduledDateTime: string;
    timezone: string;
    status: "scheduled";
  };
  createdAt: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduleData: ScheduleData) => void;
  postData: {
    imageUrl: string;
    caption: string;
    hashtags: string;
    prompt: string;
    enhancedPrompt: string;
  };
  userPlan: "free" | "pro";
  postsThisWeek?: number;
  onLimitReached?: () => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  onSchedule, 
  postData,
  userPlan = "free",
  postsThisWeek = 0,
  onLimitReached
}) => {
  const { user, timezone } = useUserContext();
  const { toast } = useToast();
  
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin']);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // 🆕 EXTENSION ID FROM YOUR SCREENSHOT
  const EXTENSION_ID = 'kchcmmkcliphohnjonecopokchgobdji';

  // Platform options with icons
  const platformOptions = [
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'facebook', name: 'Facebook', icon: '👥' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
  ];

  // Suggested optimal times
  const suggestedTimes = [
    { time: '09:00', label: '🌅 Morning Engagement' },
    { time: '12:00', label: '🍽️ Lunch Break' },
    { time: '17:00', label: '🏠 After Work' },
    { time: '20:00', label: '🌙 Evening Scroll' },
  ];

  // Check free tier limits
  const checkFreeTierLimits = () => {
    if (userPlan === "free" && postsThisWeek >= 2) {
      toast({
        title: "🚫 Weekly Limit Reached",
        description: "You've used 2/2 posts this week. Upgrade to Pro for unlimited!",
        variant: "destructive",
        duration: 6000,
      });
      
      if (onLimitReached) {
        onLimitReached();
      }
      
      return false;
    }
    return true;
  };

  // 🆕 Function to send post to extension
 const sendToExtension = async (phantomId: string, postData: any): Promise<boolean> => {
  // Check if Chrome extension API is available
  if (typeof chrome === 'undefined' || !chrome?.runtime) {
    console.log('⚠️ Chrome extension API not available');
    return false;
  }

  try {
    // Send to extension background script
    const response = await new Promise<{ success: boolean; error?: string }>((resolve) => {
      // Type assertion for TypeScript
      const chromeRuntime = chrome.runtime as any;
      
      chromeRuntime.sendMessage(EXTENSION_ID, {
        action: 'PHANTOM_POST_STORE',
        postId: phantomId,
        postData: postData
      }, (response: any) => {
        if (chromeRuntime.lastError) {
          console.log('Extension error:', chromeRuntime.lastError.message);
          resolve({ success: false, error: chromeRuntime.lastError.message });
        } else {
          resolve(response || { success: false });
        }
      });
    });

    return response.success === true;
  } catch (error) {
    console.error('Extension communication failed:', error);
    return false;
  }
};

  // 🚀 PHANTOM FILL - UPDATED VERSION
  const handlePostNow = async () => {
    if (!checkFreeTierLimits()) {
      return;
    }
    
    setIsPosting(true);
    
    try {
      const phantomId = `phantom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const postDataToStore = {
        id: phantomId,
        userId: user?.uid || 'unknown',
        caption: postData.caption,
        hashtags: postData.hashtags,
        prompt: postData.prompt,
        enhancedPrompt: postData.enhancedPrompt,
        imageUrl: postData.imageUrl,
        storedAt: Date.now(),
        expiresAt: Date.now() + 3600000
      };
      
      console.log('🚀 Starting Phantom Fill process for ID:', phantomId);
      
      // 🆕 TRY EXTENSION FIRST
      const extensionSuccess = await sendToExtension(phantomId, postDataToStore);
      
      if (extensionSuccess) {
        console.log('✅ Post sent to extension');
      } else {
        console.log('⚠️ Extension failed, using fallback methods');
      }
      
      // 🆕 STORE IN MULTIPLE PLACES
      // localStorage
      localStorage.setItem(`smartsocial_${phantomId}`, JSON.stringify(postDataToStore));
      
      // sessionStorage
      sessionStorage.setItem(`smartsocial_${phantomId}`, JSON.stringify(postDataToStore));
      
      // Global variable
      window.smartsocialPosts = window.smartsocialPosts || {};
      window.smartsocialPosts[phantomId] = postDataToStore;
      
      console.log('📦 Post stored with multiple fallbacks, ID:', phantomId);
      
      // Open LinkedIn
      const linkedinUrl = `https://www.linkedin.com/feed/?smartsocial=${phantomId}`;
      const newWindow = window.open(linkedinUrl, '_blank');
      
      if (!newWindow) {
        const textToCopy = `${postData.caption}\n\n${postData.hashtags}`;
        navigator.clipboard.writeText(textToCopy);
        
        toast({
          title: "📋 Copied to Clipboard",
          description: "Paste into LinkedIn (popup was blocked)",
          duration: 4000,
        });
        
        setTimeout(() => {
          window.location.href = linkedinUrl;
        }, 1000);
      }
      
      toast({
        title: extensionSuccess ? "🚀 Opening LinkedIn!" : "⚠️ Opening LinkedIn (fallback mode)",
        description: extensionSuccess 
          ? "Your post will auto-fill in seconds..." 
          : "Using backup method - may need manual paste",
        duration: 3000,
      });
      
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Post now failed:', error);
      toast({
        title: "Post Failed",
        description: "Please copy/paste manually.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  // Handle scheduling (existing)
  const handleSchedule = async () => {
    if (userPlan === "free" && !checkFreeTierLimits()) {
      return;
    }

    if (!selectedTime || !selectedDate || selectedPlatforms.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select time, date, and at least one platform.",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);

    try {
      const scheduledDateTime = `${selectedDate}T${selectedTime}`;
      
      const scheduledPost = {
        id: Date.now().toString(),
        userId: user?.uid || 'unknown',
        postData: {
          imageUrl: postData.imageUrl,
          caption: postData.caption,
          hashtags: postData.hashtags,
          prompt: postData.prompt,
          enhancedPrompt: postData.enhancedPrompt
        },
        schedule: {
          platforms: selectedPlatforms,
          scheduledDateTime: scheduledDateTime,
          timezone: timezone,
          status: "scheduled" as const
        },
        createdAt: new Date().toISOString()
      };

      saveScheduledPost(scheduledPost);
      console.log('📅 Post saved to localStorage:', scheduledPost);

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (userPlan === "free") {
        toast({
          title: "📅 Post Timing Ready!",
          description: `Best time: ${selectedTime}. You have ${2 - postsThisWeek - 1} posts left this week.`,
          duration: 5000,
        });
      } else {
        toast({
          title: "🚀 Scheduled with AutoPilot!",
          description: `Post scheduled for ${selectedPlatforms.length} platform(s)`,
        });
      }

      setTimeout(() => {
        onClose();
        resetForm();
        onSchedule(scheduledPost);
      }, 1000);

    } catch (error) {
      console.error('❌ Scheduling failed:', error);
      toast({
        title: "Scheduling Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const resetForm = () => {
    setSelectedTime('');
    setSelectedDate('');
    setSelectedPlatforms(['linkedin']);
    setIsScheduling(false);
    setIsPosting(false);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {userPlan === "pro" ? "🤖" : "📅"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {userPlan === "pro" ? "AutoPilot Scheduler" : "Post to Social"}
                  </h2>
                  {userPlan === "free" && (
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                      Free: {postsThisWeek}/2 used
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userPlan === "pro" 
                    ? "Schedule or post immediately" 
                    : "Post now or get scheduling advice"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Post Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              {postData.imageUrl && (
                <img 
                  src={postData.imageUrl} 
                  alt="Post preview"
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {postData.caption}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {postData.hashtags}
                </p>
              </div>
            </div>
          </div>

          {/* 🚀 PHANTOM FILL SECTION */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">🚀</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Instant Post to LinkedIn
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  One click opens LinkedIn with your post ready to publish
                </p>
              </div>
            </div>
            
            {/* Limit warning for free users */}
            {userPlan === "free" && postsThisWeek >= 2 ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  ⚠️ You've used your 2 posts this week. Upgrade to Pro for unlimited!
                </p>
              </div>
            ) : (
              <button
                onClick={handlePostNow}
                disabled={isPosting}
                className="w-full px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
              >
                {isPosting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Opening LinkedIn...
                  </>
                ) : (
                  <>
                    <span className="text-lg">✨</span>
                    Post Now to LinkedIn
                    {userPlan === "free" && (
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full ml-2">
                        {2 - postsThisWeek} left
                      </span>
                    )}
                  </>
                )}
              </button>
            )}
            
            {/* Simple instructions */}
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              💡 How it works: Post is stored → LinkedIn opens → Content auto-fills
            </div>
          </div>

          {/* Schedule Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-xl">📅</span>
              Schedule for Later
            </h3>

            {/* Date Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Schedule Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={getTodayDate()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={userPlan === "free" && postsThisWeek >= 2}
              />
            </div>

            {/* Time Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Schedule Time ({timezone})
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
                disabled={userPlan === "free" && postsThisWeek >= 2}
              />
              
              {/* Suggested Times */}
              <div className="grid grid-cols-2 gap-2">
                {suggestedTimes.map((suggestion) => (
                  <button
                    key={suggestion.time}
                    type="button"
                    onClick={() => setSelectedTime(suggestion.time)}
                    disabled={userPlan === "free" && postsThisWeek >= 2}
                    className={`p-2 text-xs border rounded-lg transition-colors ${
                      selectedTime === suggestion.time
                        ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                    } ${userPlan === "free" && postsThisWeek >= 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="font-medium">{suggestion.time}</div>
                    <div className="text-xs opacity-75">{suggestion.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Platforms
              </label>
              <div className="grid grid-cols-2 gap-3">
                {platformOptions.map((platform) => (
                  <label
                    key={platform.id}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    } ${userPlan === "free" && postsThisWeek >= 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(platform.id)}
                      onChange={() => handlePlatformToggle(platform.id)}
                      disabled={userPlan === "free" && postsThisWeek >= 2}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-lg">{platform.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {platform.name}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isScheduling}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSchedule}
              disabled={
                isScheduling || 
                !selectedTime || 
                !selectedDate || 
                selectedPlatforms.length === 0 ||
                (userPlan === "free" && postsThisWeek >= 2)
              }
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                userPlan === "pro" 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
              }`}
            >
              {isScheduling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Scheduling...
                </>
              ) : userPlan === "pro" ? (
                "🤖 Schedule with AutoPilot"
              ) : postsThisWeek >= 2 ? (
                "🚫 Limit Reached"
              ) : (
                `📅 Schedule Later`
              )}
            </button>
          </div>

          {/* Upgrade Prompt */}
          {userPlan === "free" && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  toast({
                    title: "🚀 Upgrade to Pro",
                    description: "Get unlimited posting + scheduling",
                    duration: 5000,
                  });
                  onClose();
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                Upgrade to Pro for unlimited posts →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;