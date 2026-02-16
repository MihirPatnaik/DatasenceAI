// src/smartsocial/pages/SmartSocialDashboard.tsx


import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import AnimatedCounter from "../components/AnimatedCounter";
import Header from "../components/Header";
import QuotaBar from "../components/QuotaBar";
import ScheduleModal from "../components/ScheduleModal";
import SocialPlatformIcon from "../components/SocialPlatformIcon";
import { useToast } from "../components/ui/use-toast";

// Hooks
import { useAuthGuard } from "../hooks/useAuthGuard";
import { useAuthUser } from "../hooks/useAuthUser";
import { usePreload } from "../hooks/usePreload";
import { useTheme } from "../hooks/useTheme";

// Utilities
import { db } from "../utils/firebase";
import { UserContextData } from "../utils/userContext";

/**
 * Formats user email to display name
 */
const formatUserName = (email: string | null | undefined): string => {
  if (!email) return "User";
  const username = email.split('@')[0];
  const firstName = username.split('.')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};

/**
 * Returns time-based greeting message
 */
const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

interface Post {
  id: string;
  platform: string;
  content: string;
  createdAt: any;
  status: "draft" | "scheduled" | "published";
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
  imageUrl?: string;
}

/**
 * Individual Post Card Component with expandable details
 */
interface PostCardProps {
  post: Post;
  isExpanded: boolean;
  onToggle: () => void;
  onSchedule: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, isExpanded, onToggle, onSchedule }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-800">
      {/* Post Preview */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <SocialPlatformIcon platform={post.platform} size="sm" />
            
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 dark:text-gray-200 text-sm line-clamp-2">
                {post.content}
              </p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {post.createdAt.toLocaleDateString()}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  post.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                  post.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}>
                  {post.status}
                </span>
                {post.engagement && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    👍 {post.engagement.likes} | 💬 {post.engagement.comments} | 🔄 {post.engagement.shares}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="pt-4 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Full Content</h4>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                {post.content}
              </p>
            </div>

            {post.imageUrl && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Image</h4>
                <img 
                  src={post.imageUrl} 
                  alt="Post visual"
                  className="w-48 h-32 object-cover rounded-lg border dark:border-gray-600"
                />
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Edit
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSchedule(post);
                }}
                className="px-3 py-1 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                📅 Schedule
              </button>
              <button className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                Reschedule
              </button>
              <button className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                View Analytics
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

/**
 * Better empty state component
 */
const EmptyPostsState = ({ onCreatePost }: { onCreatePost: () => void }) => (
  <div className="text-center py-12">
    <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
      <span className="text-4xl">📱</span>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No posts yet</h3>
    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
      Your scheduled and published posts will appear here. Create your first post to start building your social media presence!
    </p>
    <button
      onClick={onCreatePost}
      className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors transform hover:scale-[1.02]"
    >
      <span className="text-xl">+</span>
      <span>Create Your First Post</span>
    </button>
  </div>
);

// ====================== ADDED: PHANTOM FILL TEST BUTTON ======================
/**
 * Phantom Fill Test Button - For quick testing
 */
const PhantomTestButton = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const testPhantomFill = () => {
    // Create test post
    const postId = `test_${Date.now()}`;
    const testPost = {
      id: postId,
      caption: "🧪 SmartSocial Phantom Fill Test!\n\nIf you can see this, the auto-fill system is working perfectly! 🎉",
      hashtags: "#SmartSocial #Test #PhantomFill #Success",
      prompt: "Test post",
      enhancedPrompt: "Test phantom fill",
      imageUrl: "",
      storedAt: Date.now(),
      expiresAt: Date.now() + 3600000,
      source: 'test'
    };
    
    // Store in localStorage
    localStorage.setItem(`smartsocial_${postId}`, JSON.stringify(testPost));
    
    // Open LinkedIn
    const linkedinUrl = `https://www.linkedin.com/feed/?smartsocial=${postId}`;
    const newWindow = window.open(linkedinUrl, '_blank');
    
    // If popup blocked
    if (!newWindow) {
      navigator.clipboard.writeText(testPost.caption + '\n\n' + testPost.hashtags);
      toast({
        title: "📋 Copied to Clipboard",
        description: "Paste into LinkedIn (popup was blocked)",
      });
      window.location.href = linkedinUrl;
    }
    
    toast({
      title: "🧪 Test Started!",
      description: "LinkedIn should open with auto-filled content",
    });
    
    console.log('🧪 Test post ID:', postId);
    console.log('Storage key:', `smartsocial_${postId}`);
  };

  const goToCreatePost = () => {
    navigate("/smartsocial/create-post");
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      <button 
        onClick={testPhantomFill}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
        title="Test Phantom Fill"
      >
        🧪 Test Phantom Fill
      </button>
      <button 
        onClick={goToCreatePost}
        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
        title="Create New Post"
      >
        ✨ Create Post
      </button>
    </div>
  );
};
// ====================== END ADDED SECTION ======================


export default function SmartSocialDashboard() {
  useAuthGuard();
  usePreload();
  
  const { toast } = useToast();
  const { user, loading: userLoading } = useAuthUser();
  const { isDarkTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const userId = user?.uid || null;

  // Component State
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");
  const [activeTimeFilter, setActiveTimeFilter] = useState<"today" | "7days" | "30days" | "all">("7days");
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    scheduled: 0,
    engagement: 0,
    followers: 0
  });

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedPostForScheduling, setSelectedPostForScheduling] = useState<Post | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data() as UserContextData;
          setUserPlan(data.onboarding?.plan || "free");
        }

        await loadMockPosts();
        
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data. Please try refreshing the page.");
        toast({ 
          title: "Failed to load dashboard", 
          description: "Please try refreshing the page",
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, toast]);

  useEffect(() => {
    const preloadCreatePostPage = async () => {
      try {
        await import('./smartsocialHome');
      } catch (error) {
        console.warn('Could not preload create-post page:', error);
      }
    };

    preloadCreatePostPage();
  }, []);

  const loadMockPosts = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockPosts: Post[] = [
      {
        id: "1",
        platform: "instagram",
        content: "Just launched our new product line! 🚀 So excited to share this with our community. The response has been incredible so far! #NewProduct #Launch",
        createdAt: new Date(),
        status: "published",
        engagement: { likes: 124, comments: 28, shares: 15 },
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"
      },
      {
        id: "2", 
        platform: "twitter",
        content: "Big announcement coming tomorrow! Stay tuned for something amazing that will change the game 👀 #ComingSoon #Tech",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "scheduled",
        engagement: { likes: 42, comments: 18, shares: 9 }
      },
      {
        id: "3",
        platform: "facebook",
        content: "Join us for our weekly live Q&A session this Friday at 2 PM EST! We'll be answering all your questions about our new features and upcoming releases.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: "published",
        engagement: { likes: 145, comments: 42, shares: 28 }
      },
      {
        id: "4",
        platform: "linkedin",
        content: "Excited to announce our new partnership that will revolutionize the industry! This collaboration will bring innovative solutions to market faster. 🚀",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "published",
        engagement: { likes: 189, comments: 43, shares: 35 }
      }
    ];

    setRecentPosts(mockPosts);
    setStats({ 
      scheduled: 12, 
      engagement: 49, 
      followers: 128 
    });
    setLoading(false);
  };

  const handleCreatePost = () => {
    navigate("/smartsocial/create-post");
  };

  const togglePostExpansion = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  // Handle Schedule Action From Post Card
  const handleSchedulePost = (post: Post) => {
    setSelectedPostForScheduling(post);
    setIsScheduleModalOpen(true);
  };

  // Handle Schedule Completion
  const handleScheduleComplete = (scheduleData: any) => {
    console.log('📅 Post scheduled:', scheduleData);
    toast({
      title: "✅ Post Scheduled!",
      description: `Post scheduled for ${scheduleData.platforms.length} platform(s)`,
    });
    setIsScheduleModalOpen(false);
    setSelectedPostForScheduling(null);
  };

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Loading State
  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
          {/* Skeleton loading for better UX */}
          <div className="mt-8 space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Session Expired</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Please log in to access your dashboard.</p>
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
      {/* Fixed Navigation Header */}
      <Header 
        userPlan={userPlan}
        currentPage="Dashboard"
        onThemeToggle={toggleTheme}
        isDarkTheme={isDarkTheme}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-24">
        
        {/* Welcome & Analytics Section */}
        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8"
          >
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {getTimeBasedGreeting()}, <span className="text-purple-600 dark:text-purple-400">{formatUserName(user?.email)}</span>! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Here's what's happening with your social media today.
                </p>
                
                {/* Quick Stats Summary */}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {stats.scheduled} posts scheduled
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {stats.engagement.toLocaleString()} engagements
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    +{stats.followers} new followers
                  </span>
                </div>
              </div>
              
              {/* Current Date Display */}
              <div className="mt-4 sm:mt-0 sm:text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Today is</div>
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>

            {/* Analytics Cards with Animated Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
              >
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  <AnimatedCounter value={stats.scheduled} duration={1500} />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Scheduled Posts</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
              >
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  <AnimatedCounter value={stats.engagement} duration={1800} />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Engagement</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
              >
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  +<AnimatedCounter value={stats.followers} duration={1200} />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">New Followers</div>
              </motion.div>
            </div>

            {/* Usage Quota Tracking */}
            {userId && (
              <div className="mb-6">
                <QuotaBar userId={userId} />
              </div>
            )}

            {/* Primary Action Button */}
            <div className="text-center">
              <button
                onClick={handleCreatePost}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-sm hover:shadow-md"
              >
                <span className="text-xl">+</span>
                <span>Create New Post</span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Recent Posts Section */}
        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Your Recent Posts</h2>
              
              {/* Time Filter Controls */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {[
                  { key: "today", label: "Today" },
                  { key: "7days", label: "Last 7 Days" },
                  { key: "30days", label: "Last 30 Days" },
                  { key: "all", label: "All Time" }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveTimeFilter(filter.key as any)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeTimeFilter === filter.key
                        ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <EmptyPostsState onCreatePost={handleCreatePost} />
              ) : (
                recentPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post}
                    isExpanded={expandedPostId === post.id}
                    onToggle={() => togglePostExpansion(post.id)}
                    onSchedule={handleSchedulePost}
                  />
                ))
              )}
            </div>
          </motion.div>
        </section>

        {/* Upgrade Promotion Banner */}
        {userPlan === "free" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white text-center"
          >
            <h3 className="text-xl font-bold mb-2">✨ Upgrade to Pro</h3>
            <p className="mb-4 opacity-90">
              Get unlimited posts, advanced analytics, and team collaboration features
            </p>
            <button 
              onClick={() => navigate("/smartsocial/planadmin/pro")}
              className="px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Upgrade Now
            </button>
          </motion.div>
        )}
      </main>

      {/* Schedule Modal */}
        {selectedPostForScheduling && (
          <ScheduleModal
            isOpen={isScheduleModalOpen}
            onClose={() => {
              setIsScheduleModalOpen(false);
              setSelectedPostForScheduling(null);
            }}
            onSchedule={handleScheduleComplete}
            userPlan={userPlan} // ✅ ADD THIS LINE
            postData={{
              imageUrl: selectedPostForScheduling.imageUrl || "",
              caption: selectedPostForScheduling.content,
              hashtags: "#social #post",
              prompt: selectedPostForScheduling.content,
              enhancedPrompt: selectedPostForScheduling.content
            }}
          />
        )}
    </div>
  );
}