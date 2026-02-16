// src/smartsocial/utils/authService.ts - FINAL COMPLETE VERSION

import {
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { saveUserToFirestore } from "./userService";

// Types that match your UserDoc interface from userService.ts
interface GoogleSignupResult {
  user: any;
  isBusinessEmail: boolean;
}

/**
 * Signup with Google
 * Returns: { user, isBusinessEmail }
 * Also writes the initial user doc to Firestore (merge).
 */
export const handleGoogleSignup = async (recaptchaToken: string): Promise<GoogleSignupResult> => {
  try {
    console.log("🔄 Starting Google authentication...");
    
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log("✅ Google auth successful:", user.email);
    
    // Check if user already exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      console.log("👤 New user - creating Firestore document");
      // Create new user document
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName || "",
        photoURL: user.photoURL || "",
        provider: "google" as const,
        onboarding: {
          completed: false,
          plan: "free" as const,
          progress: 0,
          celebrated: false
        },
        createdAt: serverTimestamp()
      });
    } else {
      console.log("👤 Existing user found in Firestore");
    }
    
    // Enhanced business email check
    const freeDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com'];
    const emailDomain = user.email?.split('@')[1]?.toLowerCase();
    const isBusinessEmail = !freeDomains.includes(emailDomain || '');
    
    console.log("📧 Business email check:", isBusinessEmail, "Domain:", emailDomain);
    
    return {
      user,
      isBusinessEmail
    };
    
  } catch (error: any) {
    console.error("❌ Google authentication failed:", error);
    throw error;
  }
};

/**
 * Handle Google Signup with Redirect (for mobile/SSO flows)
 */
export const handleGoogleSignupWithRedirect = async (): Promise<void> => {
  try {
    console.log("🔄 Starting Google authentication with redirect...");
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    await signInWithRedirect(auth, provider);
    
  } catch (error: any) {
    console.error("❌ Google redirect authentication failed:", error);
    throw error;
  }
};

/**
 * Handle Google Signup redirect result
 */
export const handleGoogleRedirectResult = async (): Promise<GoogleSignupResult | null> => {
  try {
    const result = await getRedirectResult(auth);
    
    if (result?.user) {
      console.log("✅ Google redirect auth successful:", result.user.email);
      
      const user = result.user;
      
      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        console.log("👤 New user from redirect - creating Firestore document");
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: user.displayName || "",
          photoURL: user.photoURL || "",
          provider: "google" as const,
          onboarding: {
            completed: false,
            plan: "free" as const,
            progress: 0,
            celebrated: false
          },
          createdAt: serverTimestamp()
        });
      }
      
      // Enhanced business email check
      const freeDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com'];
      const emailDomain = user.email?.split('@')[1]?.toLowerCase();
      const isBusinessEmail = !freeDomains.includes(emailDomain || '');
      
      return {
        user,
        isBusinessEmail
      };
    }
    
    return null;
    
  } catch (error: any) {
    console.error("❌ Google redirect result failed:", error);
    throw error;
  }
};

/**
 * ✅ UPDATED: Signup with Email + Password (NOW ENABLED)
 * Creates the Firebase user and saves the initial Firestore document.
 */
export const handleEmailSignup = async (
  email: string, 
  password: string, 
  fullName: string = "", 
  businessEmail: string = "",
  recaptchaToken: string = ""
): Promise<any> => {
  try {
    console.log("🔄 Starting email signup...", { email, fullName });

    // ✅ NOW ENABLED: Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("✅ Email auth successful:", user.email);

    const userData = {
      fullName: fullName,
      email: user.email || email,
      provider: "email" as const,
      businessEmail: businessEmail || "",
      onboarding: {
        progress: 0,
        completed: false,
        celebrated: false,
        plan: "free" as const,
        businessName: "",
        industry: "",
        brandVibe: "",
        campaignType: "",
        quizAnswers: {},
      },
      quota: { used: 0, limit: 50 },
      createdAt: new Date(),
      // Store reCAPTCHA info for analytics/auditing
      recaptcha: {
        token: recaptchaToken,
        verifiedAt: new Date(),
      },
    };

    // Save initial user doc (merge)
    await saveUserToFirestore(user.uid, userData);
    return user;
  } catch (error: any) {
    console.error("Email signup failed:", error);

    // ✅ UPDATED ERROR HANDLING: Remove the "operation-not-allowed" case
    let errorMessage = "Email signup failed. Please try again.";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "This email is already registered. Please sign in.";
        break;
      case "auth/invalid-email":
        errorMessage = "Please enter a valid email address.";
        break;
      case "auth/weak-password":
        errorMessage = "Password is too weak. Please use a stronger password.";
        break;
      // ❌ REMOVED: "auth/operation-not-allowed" - since it's now enabled
      case "auth/network-request-failed":
        errorMessage = "Network error. Please check your connection.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many attempts. Please try again later.";
        break;
      default:
        errorMessage = error.message || "Email signup failed. Please try again.";
    }

    throw new Error(errorMessage);
  }
};

/**
 * ✅ NEW: Email Login handler for existing users
 */
export const handleEmailLogin = async (email: string, password: string): Promise<any> => {
  try {
    console.log("🔄 Starting email login...", email);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("✅ Email login successful:", user.email);
    return user;
  } catch (error: any) {
    console.error("❌ Email login failed:", error);

    let errorMessage = "Login failed. Please check your credentials.";

    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email. Please sign up first.";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password. Please try again.";
        break;
      case "auth/invalid-email":
        errorMessage = "Please enter a valid email address.";
        break;
      case "auth/user-disabled":
        errorMessage = "This account has been disabled. Please contact support.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many failed attempts. Please try again later.";
        break;
      default:
        errorMessage = error.message || "Login failed. Please try again.";
    }

    throw new Error(errorMessage);
  }
};

/**
 * Enhanced business email checker
 */
export const isBusinessEmail = (email: string): boolean => {
  if (!email) return false;
  
  const freeDomains = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
    'aol.com', 'icloud.com', 'protonmail.com', 'yandex.com',
    'mail.com', 'zoho.com', 'gmx.com'
  ];
  
  const domain = email.toLowerCase().split('@')[1];
  return !freeDomains.includes(domain || '');
};

/**
 * Check if user exists and onboarding status
 */
export const checkUserOnboardingStatus = async (userId: string): Promise<{ exists: boolean; onboardingCompleted: boolean }> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        exists: true,
        onboardingCompleted: userData.onboarding?.completed || false
      };
    }
    
    return { exists: false, onboardingCompleted: false };
  } catch (error) {
    console.error("Error checking user onboarding status:", error);
    return { exists: false, onboardingCompleted: false };
  }
};

/**
 * Handle user logout
 */
export const handleLogout = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("✅ User logged out successfully");
  } catch (error: any) {
    console.error("❌ Logout failed:", error);
    throw error;
  }
};

/**
 * Send password reset email
 */
export const handlePasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("✅ Password reset email sent to:", email);
  } catch (error: any) {
    console.error("❌ Password reset failed:", error);
    
    let errorMessage = "Failed to send reset email. Please try again.";
    
    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email.";
        break;
      case "auth/invalid-email":
        errorMessage = "Please enter a valid email address.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many attempts. Please try again later.";
        break;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (displayName?: string, photoURL?: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user logged in");
    
    await updateProfile(currentUser, {
      displayName: displayName || currentUser.displayName,
      photoURL: photoURL || currentUser.photoURL
    });
    
    console.log("✅ User profile updated");
  } catch (error: any) {
    console.error("❌ Profile update failed:", error);
    throw error;
  }
};

// ==================== EXTENSION AUTH FUNCTIONS ====================

/**
 * Handle Google authentication for extensions (with popup fallback)
 * IMPORTANT: This is used by ExtensionAuth.tsx
 */
export const handleExtensionGoogleAuth = async (mode: 'popup' | 'redirect' = 'redirect'): Promise<any> => {
  try {
    console.log("🔄 Starting extension Google auth...");
    
    const authInstance = getAuth();
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    if (mode === 'popup') {
      try {
        const result = await signInWithPopup(authInstance, provider);
        console.log("✅ Extension Google auth (popup) successful:", result.user.email);
        return result.user;
      } catch (popupError: any) {
        console.warn("Popup auth failed:", popupError);
        throw new Error('Popup authentication failed. Please try again or use email login.');
      }
    } else {
      // Redirect mode
      await signInWithRedirect(authInstance, provider);
      throw new Error('Redirecting to Google authentication...');
    }
  } catch (error: any) {
    console.error("❌ Extension Google auth failed:", error);
    
    // Preserve redirect errors
    if (error.message.includes('Redirecting')) {
      throw error;
    }
    
    let errorMessage = "Google authentication failed.";
    
    switch (error.code) {
      case 'auth/popup-blocked':
        errorMessage = 'Popup blocked by browser. Please use email login or allow popups.';
        break;
      case 'auth/popup-closed-by-user':
        errorMessage = 'Popup closed. Please try again.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Check your connection.';
        break;
      default:
        errorMessage = error.message || 'Authentication failed.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Handle redirect result for extension auth
 */
export const handleExtensionRedirectResult = async (): Promise<any> => {
  try {
    const authInstance = getAuth();
    const result = await getRedirectResult(authInstance);
    
    if (result?.user) {
      console.log("✅ Extension redirect auth successful:", result.user.email);
      return result.user;
    }
    
    return null;
  } catch (error: any) {
    console.error("❌ Extension redirect result failed:", error);
    throw error;
  }
};

/**
 * ✅ NEW: Create extension API key
 */
export const createExtensionKey = async (
  userId: string, 
  extensionId?: string,
  source: string = 'chrome_extension'
): Promise<string> => {
  try {
    const extKey = extensionId || `ext_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newKey = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
    
    console.log("🔑 Creating extension key for user:", userId, "Source:", source);
    
    // Try to save to Firestore
    const keyDocRef = doc(db, 'extension_keys', extKey);
    
    try {
      await setDoc(keyDocRef, {
        key: newKey,
        userId: userId,
        extensionId: extKey,
        source: source,
        createdAt: serverTimestamp(),
        lastUsed: null,
        isActive: true,
        rateLimit: 100,
        version: '1.0.0',
        userAgent: navigator.userAgent?.substring(0, 200) || 'unknown'
      });
      
      console.log("✅ Extension key saved to Firestore");
    } catch (firestoreError: any) {
      // Firestore permissions might fail - that's OK
      console.warn("⚠️ Could not save to Firestore (fallback to memory):", firestoreError.message);
    }
    
    return newKey;
    
  } catch (error: any) {
    console.error("❌ Failed to create extension key:", error);
    
    // Fallback: Generate a key without Firestore
    const fallbackKey = `ext_fallback_${userId}_${Date.now()}`;
    console.warn("🔄 Using fallback key:", fallbackKey);
    
    return fallbackKey;
  }
};

/**
 * ✅ NEW: Register extension usage for analytics
 */
export const registerExtensionUsage = async (
  userId: string, 
  extensionId: string, 
  action: string = 'auth'
): Promise<void> => {
  try {
    const analyticsRef = doc(db, 'extension_analytics', `${userId}_${Date.now()}`);
    
    await setDoc(analyticsRef, {
      userId: userId,
      extensionId: extensionId,
      action: action,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent?.substring(0, 200) || 'unknown',
      platform: navigator.platform,
      language: navigator.language
    });
    
    console.log("📊 Extension usage logged:", action);
  } catch (error) {
    // Silent fail for analytics - not critical
    console.warn("Could not log extension usage:", error);
  }
};

/**
 * ✅ NEW: Validate extension authentication parameters
 */
export const validateExtensionAuth = (
  email?: string | null,
  password?: string | null,
  mode?: string | null
): { valid: boolean; error?: string } => {
  
  // Validate email/password if provided
  if (email && password) {
    if (!email.includes('@')) {
      return { valid: false, error: 'Invalid email format' };
    }
    if (password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters' };
    }
  }
  
  // Validate mode
  if (mode && !['popup', 'redirect'].includes(mode)) {
    return { valid: false, error: 'Invalid mode parameter' };
  }
  
  return { valid: true };
};

/**
 * ✅ NEW: Get extension API endpoints
 */
export const getExtensionEndpoints = (baseUrl: string = 'https://datasenceai.com') => {
  return {
    caption: `${baseUrl}/api/extension/v1/linkedin/caption`,
    quota: `${baseUrl}/api/extension/v1/quota`,
    track: `${baseUrl}/api/extension/v1/track`,
    health: `${baseUrl}/api/health`,
    version: '1.0.0'
  };
};

/**
 * ✅ NEW: User-friendly error messages for extension auth
 */
export const getExtensionAuthErrorMessage = (error: any): string => {
  const code = error?.code || '';
  const message = error?.message || '';
  
  switch(code) {
    case 'auth/popup-blocked':
      return 'Popup blocked. Please use email login or allow popups for this site.';
    case 'auth/popup-closed-by-user':
      return 'Login popup was closed. Please try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/too-many-requests':
      return 'Too many login attempts. Please wait a few minutes.';
    case 'auth/user-disabled':
      return 'Account disabled. Contact support@datasenceai.com';
    case 'auth/operation-not-supported-in-this-environment':
      return 'Your browser does not support this login method. Try Chrome or Firefox.';
    case 'permission-denied':
      return 'Access denied. Please check your account permissions.';
    default:
      if (message.includes('extension')) return message;
      if (message.includes('Firestore')) return 'Database error. Please try again.';
      return 'Authentication failed. Please try again.';
  }
};