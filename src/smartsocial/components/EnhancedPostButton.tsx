// src/smartsocial/components/EnhancedPostButton.tsx

import { useState } from 'react';
import { useToast } from './ui/use-toast';

interface EnhancedPostButtonProps {
  imageUrl: string;
  caption: string;
  hashtags: string;
  prompt: string;
  enhancedPrompt: string;
  userPlan: "free" | "pro";
  postsThisWeek?: number;
  onBack?: () => void;
  onSchedule?: (scheduleData: any) => void;
}

export default function EnhancedPostButton({
  imageUrl,
  caption,
  hashtags,
  prompt,
  enhancedPrompt,
  userPlan,
  postsThisWeek = 0,
  onBack,
  onSchedule
}: EnhancedPostButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // 🆕 EXTENSION ID FROM YOUR SCREENSHOT
  const EXTENSION_ID = 'kchcmmkcliphohnjonecopokchgobdji';

  // 🆕 Function to send post to extension
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

  // 🆕 Multiple storage fallback strategy
  const storePostMultipleWays = (phantomId: string, postData: any) => {
    console.log('📦 Storing post in multiple locations for redundancy');
    
    // 1. localStorage (basic fallback)
    try {
      localStorage.setItem(`smartsocial_${phantomId}`, JSON.stringify(postData));
    } catch (e) {
      console.log('localStorage failed:', e);
    }
    
    // 2. sessionStorage (sometimes works cross-tab)
    try {
      sessionStorage.setItem(`smartsocial_${phantomId}`, JSON.stringify(postData));
    } catch (e) {
      console.log('sessionStorage failed:', e);
    }
    
    // 3. Global window variable (for same-tab access)
    try {
      window.smartsocialPosts = window.smartsocialPosts || {};
      window.smartsocialPosts[phantomId] = postData;
    } catch (e) {
      console.log('window variable failed:', e);
    }
    
    // 4. Document cookie (last resort)
    try {
      document.cookie = `smartsocial_${phantomId}=${encodeURIComponent(JSON.stringify(postData))}; path=/; max-age=3600`;
    } catch (e) {
      console.log('cookie failed:', e);
    }
  };

  const handlePostNow = async () => {
    // Check free tier limits
    if (userPlan === "free" && postsThisWeek >= 2) {
      toast({
        title: "🚫 Weekly Limit Reached",
        description: "You've used 2/2 posts this week. Upgrade to Pro for unlimited!",
        variant: "destructive",
        duration: 6000,
      });
      return;
    }

    setLoading(true);
    
    try {
      // Generate unique post ID
      const phantomId = `phantom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare post data
      const postData = {
        id: phantomId,
        imageUrl,
        caption,
        hashtags,
        prompt,
        enhancedPrompt,
        storedAt: Date.now(),
        expiresAt: Date.now() + 3600000, // 1 hour
        source: 'web_app'
      };
      
      console.log('🚀 Starting Phantom Fill process for ID:', phantomId);
      
      // 🆕 TRY EXTENSION FIRST (Most reliable)
      const extensionSuccess = await sendToExtension(phantomId, postData);
      
      if (extensionSuccess) {
        console.log('✅ Successfully sent to extension');
      } else {
        console.log('⚠️ Extension failed, using fallback methods');
      }
      
      // 🆕 STORE IN MULTIPLE PLACES for redundancy
      storePostMultipleWays(phantomId, postData);
      
      // Open LinkedIn with parameter
      // 🆕 Use the main feed URL for better composer detection
      const linkedinUrl = `https://www.linkedin.com/feed/?smartsocial=${phantomId}`;
      
      console.log('🔗 Opening LinkedIn URL:', linkedinUrl);
      
      // Try to open in new tab
      const newWindow = window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
      
      // If popup blocked, show clipboard fallback
      if (!newWindow) {
        console.log('⚠️ Popup was blocked, using clipboard fallback');
        
        // Copy to clipboard
        const textToCopy = `${caption}\n\n${hashtags}`;
        navigator.clipboard.writeText(textToCopy);
        
        toast({
          title: "📋 Copied to Clipboard",
          description: "Post text copied! LinkedIn popup was blocked. Opening in same tab...",
          duration: 4000,
        });
        
        // Open LinkedIn in same tab after delay
        setTimeout(() => {
          window.location.href = linkedinUrl;
        }, 1500);
      } else {
        // Successfully opened new window
        toast({
          title: "🚀 Opening LinkedIn!",
          description: "Your post will auto-fill in seconds...",
          duration: 3000,
        });
        
        // 🆕 Monitor the opened window to see if it loads
        setTimeout(() => {
          try {
            if (newWindow.closed) {
              console.log('LinkedIn window closed by user');
            } else {
              console.log('LinkedIn window is still open');
            }
          } catch (e) {
            // Can't access cross-origin window
          }
        }, 3000);
      }
      
    } catch (error) {
      console.error('❌ Post now failed:', error);
      toast({
        title: "Post Failed",
        description: "Please try the copy/paste option below.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleClick = () => {
    if (onSchedule) {
      const scheduleData = {
        id: Date.now().toString(),
        postData: {
          imageUrl,
          caption,
          hashtags,
          prompt,
          enhancedPrompt
        }
      };
      onSchedule(scheduleData);
    }
  };

  const handleCopyText = () => {
    const textToCopy = `${caption}\n\n${hashtags}`;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "📋 Copied!",
      description: "Text copied to clipboard",
      duration: 2000,
    });
  };

  // 🆕 DEBUG: Show storage status
  const debugStorage = () => {
    console.log('🔍 DEBUG: Checking storage methods...');
    console.log('Chrome API available:', typeof chrome !== 'undefined');
    console.log('Chrome runtime:', chrome?.runtime ? 'YES' : 'NO');
    console.log('Extension ID:', EXTENSION_ID);
    
    // Test localStorage
    const testKey = 'smartsocial_test';
    localStorage.setItem(testKey, 'test_value');
    console.log('localStorage test:', localStorage.getItem(testKey) === 'test_value' ? '✅' : '❌');
    localStorage.removeItem(testKey);
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Your Post is Ready! 🎉
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Choose how you want to share it
        </p>
        
        {/* 🆕 Debug button (remove in production) */}
        <button 
          onClick={debugStorage}
          className="mt-2 text-xs text-gray-500 hover:text-gray-700"
        >
          🔍 Debug Storage
        </button>
      </div>

      {/* Preview - same as before */}
      <div className="space-y-4">
        {imageUrl && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Image Preview</h3>
            <img 
              src={imageUrl} 
              alt="Post Preview" 
              className="w-full max-h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Caption</h3>
            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              {caption}
            </p>
          </div>
          
          {hashtags && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Hashtags</h3>
              <p className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                {hashtags}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-4">
        {/* 🚀 Post Now Button with extension status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Instant Post</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Extension: {typeof chrome !== 'undefined' ? '✅' : '❌'}
            </span>
          </div>
          
          <button
            onClick={handlePostNow}
            disabled={loading || (userPlan === "free" && postsThisWeek >= 2)}
            className="w-full px-6 py-4 text-white rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Opening LinkedIn...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🚀</span>
                <span>Post Now to LinkedIn</span>
                {userPlan === "free" && postsThisWeek < 2 && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {2 - postsThisWeek} left
                  </span>
                )}
              </div>
            )}
          </button>
          
          {/* Manual Copy Button */}
          <button
            onClick={handleCopyText}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            📋 Copy Text to Clipboard
          </button>
          
          {/* Limit warning */}
          {userPlan === "free" && postsThisWeek >= 2 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
              ⚠️ You've used your 2 posts this week. Upgrade to Pro for unlimited!
            </p>
          )}
          
          {/* 🆕 How it works explanation */}
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="font-medium mb-1">💡 How Phantom Fill works:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Post data is sent to extension</li>
              <li>LinkedIn opens with magic link</li>
              <li>Extension auto-fills your post</li>
              <li>You click "Post" on LinkedIn</li>
            </ol>
          </div>
        </div>
        
        {/* Or Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>
        
        {/* Schedule Button */}
        {onSchedule && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Schedule for Later</h3>
            <button
              onClick={handleScheduleClick}
              className="w-full px-6 py-4 text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">📅</span>
                <span>Schedule Post</span>
              </div>
            </button>
          </div>
        )}
        
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            ← Back to Edit
          </button>
        )}
      </div>
      
      {/* Info Note */}
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 <strong>Need help?</strong> If Phantom Fill doesn't work, use the copy button above.
        </p>
      </div>
    </div>
  );
}