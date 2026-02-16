// src/smartsocial/utils/storage.ts

export interface ScheduledPost {
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
    status: "scheduled" | "publishing" | "published" | "cancelled";
  };
  createdAt: string;
}

const STORAGE_KEY = 'smartsocial_scheduled_posts';

// Save a scheduled post
export const saveScheduledPost = (post: ScheduledPost): void => {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  const allPosts: ScheduledPost[] = stored ? JSON.parse(stored) : [];
  
  // Add new post
  const updatedPosts = [...allPosts, post];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
};

// Get all scheduled posts for a user
export const getScheduledPosts = (userId: string): ScheduledPost[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  const allPosts: ScheduledPost[] = JSON.parse(stored);
  return allPosts.filter(post => post.userId === userId);
};

// Delete a scheduled post
export const deleteScheduledPost = (postId: string): void => {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  
  const allPosts: ScheduledPost[] = JSON.parse(stored);
  const updatedPosts = allPosts.filter(post => post.id !== postId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
};