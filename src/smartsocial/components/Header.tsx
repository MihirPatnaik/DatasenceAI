//src/smartsocial/components/Header.tsx

import { signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthUser } from "../hooks/useAuthUser";
import { auth } from "../utils/firebase";
import { useToast } from "./ui/use-toast";

// Types for better TypeScript support
interface HeaderProps {
  userPlan: "free" | "pro";
  currentPage?: string;
  onThemeToggle?: () => void;
  isDarkTheme?: boolean;
  showSignOut?: boolean;
}

interface NavigationItem {
  name: string;
  path: string;
  icon: string;
  disabled?: boolean;
}

// Utility functions with proper typing
const getUserFirstName = (email: string | null | undefined): string => {
  if (!email) return "User";
  const firstName = email.split("@")[0].split(".")[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};

const getUserAvatarColor = (email: string | null | undefined): string => {
  if (!email) return "from-purple-500 to-indigo-500";
  
  const colorPairs = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-blue-500",
    "from-rose-500 to-pink-500",
    "from-amber-500 to-orange-500",
  ] as const;
  
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPairs.length;
  return colorPairs[index];
};

const Header: React.FC<HeaderProps> = ({
  userPlan,
  currentPage = "Dashboard",
  onThemeToggle,
  isDarkTheme = false,
  showSignOut = true,
}) => {
  const { user } = useAuthUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Navigation items with proper typing
  const navigationItems: NavigationItem[] = [
    { name: "Dashboard", path: "/smartsocial/dashboard", icon: "📊" },
    // REMOVED: { name: "Create Post", path: "/smartsocial/create-post", icon: "✏️" },
    { name: "Scheduler", path: "/smartsocial/scheduler", icon: "📅" },
    { name: "Analytics", path: "#", icon: "📈", disabled: true },
  ];

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async (): Promise<void> => {
    try {
      localStorage.setItem("showSignOutToast", "true");
      await signOut(auth);
      window.sessionStorage.clear();
      window.location.href = "/smartsocial/login";
    } catch (err) {
      console.error("❌ Sign out failed:", err);
      toast({ 
        title: "❌ Sign out failed", 
        variant: "destructive", 
        duration: 4000 
      });
    }
  };

  const toggleUserMenu = (): void => setShowUserMenu(!showUserMenu);

  const userFirstName = getUserFirstName(user?.email);
  const userAvatarColor = getUserAvatarColor(user?.email);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-900 dark:bg-gray-800 shadow-lg border-b border-gray-700"
          : "bg-gray-900 dark:bg-gray-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg"></div>
            <h1 className="text-xl font-bold text-white">SmartSocial</h1>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                userPlan === "pro"
                  ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {userPlan === "pro" ? "✨ PRO" : "FREE"}
            </span>
          </div>

          {/* Center: Navigation - In the navigation section, update the button styles: */}
        <nav className="hidden md:flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {navigationItems.map((item) => (
                <button
                key={item.name}
                onClick={() => !item.disabled && navigate(item.path)}
                disabled={item.disabled}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === item.name
                    ? "bg-blue-500 text-white shadow-sm" // ✅ Better active state
                    : item.disabled
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50"
                }`}
                >
                <span>{item.icon}</span>
                <span>{item.name}</span>
                </button>
            ))}
        </nav>

          {/* Right: User Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            {onThemeToggle && (
              <button
                onClick={onThemeToggle}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
                aria-label={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
              >
                {isDarkTheme ? (
                  <span className="text-yellow-400 text-lg">☀️</span>
                ) : (
                  <span className="text-white-300 text-lg">🌙</span>
                )}
              </button>
            )}

            {/* Quick Links */}
            <div className="hidden sm:flex items-center space-x-2">
                <a
                    href="#"
                    className="text-white font-medium transition-colors text-sm px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900" // ✅ Force white text
                >
                    📱 App
                </a>
                <a
                    href="#"
                    className="text-white font-medium transition-colors text-sm px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900" // ✅ Force white text
                >
                    ❓ Help
                </a>
            </div>

            {/* User Avatar - In the user avatar section, remove the text block: */}
            
        <div className="relative" ref={userMenuRef}>
            <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 transition-colors group" // ✅ REMOVED: space-x-3
                aria-expanded={showUserMenu}
                aria-haspopup="true"
            >
                {/* ❌ REMOVE THIS ENTIRE TEXT BLOCK: */}
                {/* <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{userFirstName}</p>
                <p className="text-xs text-gray-400">Welcome back!</p>
                </div> */}

                <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-lg bg-gradient-to-r ${userAvatarColor}`}
                >
                {userFirstName.charAt(0).toUpperCase()}
                </div>

                <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{userFirstName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate("/smartsocial/dashboard");
                        setShowUserMenu(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      role="menuitem"
                    >
                      <span>📊</span>
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate("/smartsocial/create-post");
                        setShowUserMenu(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      role="menuitem"
                    >
                      <span>✏️</span>
                      <span>Create Post</span>
                    </button>
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      role="menuitem"
                    >
                      <span>👤</span>
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      role="menuitem"
                    >
                      <span>💳</span>
                      <span>Billing & Plans</span>
                    </button>
                  </div>

                  {onThemeToggle && (
                    <div className="border-t border-gray-100 dark:border-gray-700 py-2">
                      <button
                        onClick={() => {
                          onThemeToggle();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        role="menuitem"
                      >
                        <span>{isDarkTheme ? "☀️" : "🌙"}</span>
                        <span>{isDarkTheme ? "Light Mode" : "Dark Mode"}</span>
                      </button>
                    </div>
                  )}

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      role="menuitem"
                    >
                      <span>🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;