// src/smartsocial/pages/SchedulerManager.tsx

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useToast } from "../components/ui/use-toast";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { useAuthUser } from "../hooks/useAuthUser";
import { useTheme } from "../hooks/useTheme";
import { deleteScheduledPost, getScheduledPosts, saveScheduledPost, ScheduledPost } from '../utils/storage';

// 🚨 DELETE ALL THESE - THEY'RE DUPLICATES FROM storage.ts 🚨
/*
interface ScheduledPost {
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

// Real data storage functions
const STORAGE_KEY = 'smartsocial_scheduled_posts';

const getScheduledPosts = (userId: string): ScheduledPost[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  const allPosts: ScheduledPost[] = JSON.parse(stored);
  return allPosts.filter(post => post.userId === userId);
};

const saveScheduledPost = (post: ScheduledPost): void => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(STORAGE_KEY);
  const allPosts: ScheduledPost[] = stored ? JSON.parse(stored) : [];
  
  // Remove existing post with same ID
  const filteredPosts = allPosts.filter(p => p.id !== post.id);
  const updatedPosts = [...filteredPosts, post];
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
};

const deleteScheduledPost = (postId: string): void => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  
  const allPosts: ScheduledPost[] = JSON.parse(stored);
  const updatedPosts = allPosts.filter(post => post.id !== postId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
};
*/

export default function SchedulerManager() {
  useAuthGuard();
  const { user } = useAuthUser();
  const { isDarkTheme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");

  // Load real scheduled posts
  useEffect(() => {
    const loadScheduledPosts = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const posts = getScheduledPosts(user.uid);
        setScheduledPosts(posts);
        
        // Set user plan (you can get this from user context later)
        setUserPlan("free"); // Default to free for now
        
      } catch (error) {
        console.error("Failed to load scheduled posts:", error);
        toast({
          title: "❌ Failed to load scheduled posts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadScheduledPosts();
  }, [user, toast]);

  // Cancel scheduled post - REAL FUNCTIONALITY
  const handleCancelSchedule = (postId: string) => {
    const updatedPosts = scheduledPosts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            schedule: { ...post.schedule, status: "cancelled" as const } 
          }
        : post
    );
    
    setScheduledPosts(updatedPosts);
    
    // Update in localStorage
    const postToUpdate = updatedPosts.find(p => p.id === postId);
    if (postToUpdate) {
      saveScheduledPost(postToUpdate);
    }
    
    toast({
      title: "✅ Schedule Cancelled",
      description: "The post schedule has been cancelled successfully.",
    });
  };

  // Delete scheduled post completely
  const handleDeleteSchedule = (postId: string) => {
    const updatedPosts = scheduledPosts.filter(post => post.id !== postId);
    setScheduledPosts(updatedPosts);
    
    // Remove from localStorage
    deleteScheduledPost(postId);
    
    toast({
      title: "🗑️ Schedule Deleted",
      description: "The scheduled post has been removed completely.",
    });
  };

  // Edit scheduled post - Placeholder for now
  const handleEditSchedule = (postId: string) => {
    toast({
      title: "🔄 Edit Feature Coming Soon",
      description: "Post rescheduling will be available in the next update!",
    });
  };

  // Publish now (for testing)
  const handlePublishNow = (postId: string) => {
    const updatedPosts = scheduledPosts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            schedule: { ...post.schedule, status: "published" as const } 
          }
        : post
    );
    
    setScheduledPosts(updatedPosts);
    
    const postToUpdate = updatedPosts.find(p => p.id === postId);
    if (postToUpdate) {
      saveScheduledPost(postToUpdate);
    }
    
    toast({
      title: "🚀 Post Published!",
      description: "The post has been published successfully.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header 
          userPlan={userPlan}
          currentPage="Scheduler"
          onThemeToggle={toggleTheme}
          isDarkTheme={isDarkTheme}
        />
        <div className="flex items-center justify-center min-h-screen pt-24">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading your scheduled posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header 
        userPlan={userPlan}
        currentPage="Scheduler"
        onThemeToggle={toggleTheme}
        isDarkTheme={isDarkTheme}
      />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8"
        >
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📅 Post Scheduler
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage all your scheduled posts in one place
              </p>
            </div>
            
            <button
              onClick={() => navigate("/smartsocial/create-post")}
              className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
            >
              <span>✏️</span>
              <span>Create & Schedule New Post</span>
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {scheduledPosts.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Scheduled</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {scheduledPosts.filter(p => p.schedule.status === "scheduled").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Active</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {scheduledPosts.filter(p => p.schedule.status === "published").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Published</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {scheduledPosts.filter(p => p.schedule.status === "cancelled").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Cancelled</div>
            </div>
          </div>

          {/* Scheduled Posts List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Scheduled Posts ({scheduledPosts.length})
            </h2>

            {scheduledPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">⏰</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  No Scheduled Posts Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Schedule your first post to see it appear here. Create engaging content and schedule it for optimal timing.
                </p>
                <button
                  onClick={() => navigate("/smartsocial/create-post")}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
                >
                  <span>✏️</span>
                  <span>Create Your First Scheduled Post</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledPosts.map((post) => (
                  <ScheduledPostCard
                    key={post.id}
                    post={post}
                    onCancel={handleCancelSchedule}
                    onDelete={handleDeleteSchedule}
                    onEdit={handleEditSchedule}
                    onPublishNow={handlePublishNow}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// Updated Scheduled Post Card Component
interface ScheduledPostCardProps {
  post: ScheduledPost;
  onCancel: (postId: string) => void;
  onDelete: (postId: string) => void;
  onEdit: (postId: string) => void;
  onPublishNow: (postId: string) => void;
}

const ScheduledPostCard: React.FC<ScheduledPostCardProps> = ({ 
  post, 
  onCancel, 
  onDelete, 
  onEdit, 
  onPublishNow 
}) => {
  const scheduledDate = new Date(post.schedule.scheduledDateTime);
  const now = new Date();
  const timeUntilSchedule = scheduledDate.getTime() - now.getTime();
  const hoursUntilSchedule = Math.floor(timeUntilSchedule / (1000 * 60 * 60));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "publishing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "published": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 p-6 hover:shadow-md transition-all">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Post Preview */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {post.postData.imageUrl && (
              <img 
                src={post.postData.imageUrl} 
                alt="Post preview"
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 dark:text-gray-200 text-sm line-clamp-2 mb-2">
                {post.postData.caption}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                {post.postData.hashtags}
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 lg:gap-2 xl:gap-4 items-start lg:items-end xl:items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Platforms:</span>
              <div className="flex gap-1">
                {post.schedule.platforms.map(platform => (
                  <span key={platform} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Scheduled:</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {scheduledDate.toLocaleString()} ({post.schedule.timezone})
              </span>
            </div>

            {hoursUntilSchedule > 0 && post.schedule.status === "scheduled" && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {hoursUntilSchedule < 24 
                  ? `In ${hoursUntilSchedule} hours` 
                  : `In ${Math.ceil(hoursUntilSchedule / 24)} days`
                }
              </div>
            )}
          </div>

          {/* Status & Actions */}
          <div className="flex flex-col sm:items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.schedule.status)}`}>
              {post.schedule.status.toUpperCase()}
            </span>
            
            <div className="flex gap-2">
              {post.schedule.status === "scheduled" && (
                <>
                  <button
                    onClick={() => onPublishNow(post.id)}
                    className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Publish Now
                  </button>
                  <button
                    onClick={() => onEdit(post.id)}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onCancel(post.id)}
                    className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={() => onDelete(post.id)}
                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};