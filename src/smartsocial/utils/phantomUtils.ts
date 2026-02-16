// src/smartsocial/utils/phantomUtils.ts

export interface PhantomPost {
  id: string;
  userId: string;
  postData: {
    imageUrl: string;
    caption: string;
    hashtags: string;
    prompt: string;
    enhancedPrompt: string;
  };
  platform: 'linkedin' | 'twitter' | 'facebook';
  createdAt: string;
}

/**
 * Store post for Phantom Fill
 */
export const storeForPhantomFill = (post: PhantomPost): string => {
  const postId = post.id;
  
  // Store in localStorage (for web app access)
  localStorage.setItem(`phantom_${postId}`, JSON.stringify({
    ...post,
    storedAt: Date.now(),
    expiresAt: Date.now() + 3600000 // 1 hour
  }));
  
  // Try to send to extension if available
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    try {
      chrome.runtime.sendMessage({
        type: 'PHANTOM_POST',
        postId,
        postData: post
      });
    } catch (error) {
      console.warn('Could not send to extension:', error);
    }
  }
  
  return postId;
};

/**
 * Get Phantom Post by ID
 */
export const getPhantomPost = (postId: string): PhantomPost | null => {
  // Try localStorage first
  const stored = localStorage.getItem(`phantom_${postId}`);
  if (stored) {
    const data = JSON.parse(stored);
    
    // Check if expired
    if (data.expiresAt && data.expiresAt < Date.now()) {
      localStorage.removeItem(`phantom_${postId}`);
      return null;
    }
    
    return data;
  }
  
  return null;
};

/**
 * Generate LinkedIn URL with Phantom parameter
 */
export const generateLinkedInUrl = (postId: string): string => {
  return `https://www.linkedin.com/feed/?smartsocial=${postId}`;
};

/**
 * Clean up expired Phantom posts
 */
export const cleanupPhantomPosts = (): void => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('phantom_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key)!);
        if (data.expiresAt && data.expiresAt < Date.now()) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        localStorage.removeItem(key);
      }
    }
  });
};