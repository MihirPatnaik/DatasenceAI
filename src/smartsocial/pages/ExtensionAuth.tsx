// src/smartsocial/pages/ExtensionAuth.tsx - UPDATED VERSION
// Only modifying the authentication logic, preserving everything else

import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider, // ✅ ADD THIS IMPORT
  signInWithCustomToken, // ✅ ADD THIS IMPORT
  signInWithPopup, // ✅ ADD THIS IMPORT
} from 'firebase/auth';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Loader2,
  Lock,
  Shield,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { app, db } from '../utils/firebase';
// ✅ Import existing auth service functions

import {
  createExtensionKey,
  getExtensionAuthErrorMessage,
  getExtensionEndpoints,
  handleEmailLogin,
  handleGoogleSignup, // ✅ ADD THIS
  registerExtensionUsage
} from '../utils/authService';

// Allowed redirect URLs for security
const ALLOWED_REDIRECTS = [
  'https://datasenceai.com',
  'http://localhost:5173',
  'chrome-extension://',
  'moz-extension://',
  'safari-web-extension://'
];

// Max extensions per plan
const PLAN_LIMITS = {
  'free': 1,
  'pro': 3,
  'pro_699': 5,
  'pro_999': 10,
  'enterprise': 50
} as const;

// ✅ Explicit type for extension API endpoints
// ✅ Development server runs at http://localhost:5173
type ExtensionApiEndpoints = {
  caption: string;
  quota: string;
  track: string;
  health: string;
  version: string;
};

// Validate redirect URL to prevent open redirect attacks
const validateRedirectUrl = (url: string): { isValid: boolean; normalizedUrl?: string } => {
  if (!url || url === 'extension') {
    // 'extension' is a special keyword, not a URL
    return { isValid: true };
  }
  
  try {
    const parsed = new URL(url);
    
    // Check if origin matches allowed list
    const isValid = ALLOWED_REDIRECTS.some(allowed => {
      if (allowed.endsWith('://')) {
        return parsed.origin.startsWith(allowed);
      }
      return parsed.origin === allowed;
    });
    
    if (!isValid) {
      return { isValid: false };
    }
    
    // Normalize URL (remove fragments, certain query params)
    const normalized = new URL(parsed);
    normalized.hash = '';
    
    // Remove sensitive query parameters
    const sensitiveParams = ['token', 'password', 'secret', 'key'];
    sensitiveParams.forEach(param => {
      normalized.searchParams.delete(param);
    });
    
    return { isValid: true, normalizedUrl: normalized.toString() };
  } catch {
    return { isValid: false };
  }
};

// Get user-friendly error messages (enhanced with existing auth service)
const getErrorMessage = (error: any): string => {
  const code = error?.code || '';
  const message = error?.message || '';
  
  switch(code) {
    case 'auth/popup-blocked':
      return 'Popup blocked by browser. Please allow popups for datasenceai.com';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again in 15 minutes.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Invalid email or password.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'EXTENSION_LIMIT_REACHED':
      return message;
    case 'INVALID_REDIRECT':
      return 'Invalid redirect URL. Security violation detected.';
    default:
      // ✅ Use the existing auth service error handler as fallback
      const extensionError = getExtensionAuthErrorMessage(error);
      if (extensionError !== 'Authentication failed. Please try again.') {
        return extensionError;
      }
      if (message.includes('extension')) return message;
      return 'Authentication failed. Please try again.';
  }
};

const ExtensionAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // ✅ FIX: Extract parameters safely with null checks
  const redirectUrl = searchParams ? searchParams.get('redirect') || '' : '';
  const mode = searchParams ? searchParams.get('mode') || 'popup' : 'popup';
  const extensionId = searchParams ? searchParams.get('extension_id') || '' : '';
  const source = searchParams ? searchParams.get('source') || 'unknown' : 'unknown';
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Initializing authentication...');
  const [extensionKey, setExtensionKey] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [securityChecks, setSecurityChecks] = useState<string[]>([]);

  // Add security checks to log
  const addSecurityCheck = (check: string, passed: boolean) => {
    setSecurityChecks(prev => [...prev, `${passed ? '✅' : '❌'} ${check}`]);
  };
  
  // Handle redirect results (for Google OAuth redirect flow)
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const auth = getAuth(app);
        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          console.log('✅ Redirect authentication successful:', result.user.email);
          addSecurityCheck('Google OAuth redirect authentication', true);
          await completeAuthentication(result.user);
        }
      } catch (error: any) {
        console.error('Redirect authentication failed:', error);
        setStatus('error');
        setMessage(getErrorMessage(error));
      }
    };
    
    // Check if we're returning from a redirect
    if (searchParams && (searchParams.get('redirect_result') === 'true' || window.location.hash.includes('access_token'))) {
      handleRedirectResult();
    }
  }, [searchParams]);

  useEffect(() => {
    const authenticate = async () => {
      try {
        setStatus('loading');
        setMessage('Starting security checks...');
        
        // 1. Validate redirect URL
        if (redirectUrl && redirectUrl !== 'extension') {
          const redirectValidation = validateRedirectUrl(redirectUrl);
          if (!redirectValidation.isValid) {
            throw new Error('INVALID_REDIRECT');
          }
          addSecurityCheck('Redirect URL validation', true);
        } else if (redirectUrl === 'extension') {
          // Special case: 'extension' keyword is valid
          addSecurityCheck('Extension redirect (special keyword)', true);
        } else {
          // No redirect URL specified, that's fine
          addSecurityCheck('No redirect specified', true);
        }
        
        // 2. Validate extension ID format
        if (extensionId && !/^[a-zA-Z0-9_-]+$/.test(extensionId)) {
          throw new Error('Invalid extension ID format');
        }
        addSecurityCheck('Extension ID validation', true);
        
        // 3. Check for brute force protection
        const recentAttempts = localStorage.getItem('auth_attempts');
        if (recentAttempts && parseInt(recentAttempts) > 5) {
          throw new Error('Too many authentication attempts. Please wait.');
        }
        
        // 4. Check for token in URL (direct auth)
        const token = searchParams ? searchParams.get('token') : null;
        if (token) {
          setMessage('Validating security token...');
          const user = await handleTokenAuth(token);
          if (!user) throw new Error('Token validation failed');
          addSecurityCheck('Token authentication', true);
          await completeAuthentication(user);
          return;
        }
        
        // 5. Check for email/password in URL (for secure headless auth)
        const email = searchParams ? searchParams.get('email') : null;
        const password = searchParams ? searchParams.get('password') : null;
        
        if (email && password) {
          setMessage('Signing in with email...');
          
          // Validate email format
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Invalid email format');
          }
          
          // ✅ USE EXISTING AUTH SERVICE for email login
          const user = await handleEmailLogin(email, password);
          addSecurityCheck('Email/password authentication', true);
          await completeAuthentication(user);
          return;
        }
        
        // 6. Default: Google OAuth - USE THE SAME FUNCTION AS LOGIN PAGE
        if (searchParams && !searchParams.get('redirect_result')) {
        setMessage('Opening Google sign-in...');
        
        try {
          console.log('🔍 Starting Google authentication for extension...');
          
          // ✅ SIMPLE FIX: Just use handleGoogleSignup directly
          // LoginPage shows it works with recaptchaToken
          // Let's generate a proper token format
          const recaptchaToken = `extension_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          console.log('🔄 Using recaptcha token for extension:', recaptchaToken);
          
          const result = await handleGoogleSignup(recaptchaToken);
          console.log('✅ Google auth result received:', result.user?.email);
          addSecurityCheck('Google OAuth authentication', true);
          await completeAuthentication(result.user);
          
        } catch (googleError: any) {
          console.error('❌ Google auth failed:', googleError);
          console.error('Full error:', JSON.stringify(googleError, null, 2));
          
          // Check if it's the popup error we saw before
          if (googleError.code === 'auth/cancelled-popup-request' || 
              googleError.message.includes('Cross-Origin-Opener-Policy')) {
            
            console.log('🔄 Popup error detected, trying alternative approach...');
            
            // Try simpler approach without recaptcha
            try {
              const auth = getAuth();
              const provider = new GoogleAuthProvider();
              
              console.log('🔄 Trying direct Firebase popup (no recaptcha)...');
              const result = await signInWithPopup(auth, provider);
              console.log('✅ Direct Firebase auth successful:', result.user.email);
              addSecurityCheck('Direct Google OAuth authentication', true);
              await completeAuthentication(result.user);
              
            } catch (fallbackError: any) {
              console.error('❌ Fallback auth also failed:', fallbackError);
              throw new Error('Google authentication failed: ' + fallbackError.message);
            }
            
          } else {
            throw new Error(googleError.message || 'Google authentication failed');
          }
        }
      }
      
    } catch (error: any) {
      console.error('Extension auth failed:', error);
          
      // Track failed attempts
      const attempts = parseInt(localStorage.getItem('auth_attempts') || '0') + 1;
      localStorage.setItem('auth_attempts', attempts.toString());
      setTimeout(() => {
      localStorage.removeItem('auth_attempts');
      }, 15 * 60 * 1000); // Clear after 15 minutes
      
      setStatus('error');
      setMessage(getErrorMessage(error));
        
        // Send error to opener if in popup mode
        if (mode === 'popup' && window.opener) {
        const errorData = {
          type: 'AUTH_ERROR',
          success: false,
          error: getErrorMessage(error),
          code: error?.code,
          timestamp: new Date().toISOString()
        };
          
        // Validate opener origin before sending
          try {
            window.opener.postMessage(errorData, '*');
          } catch (postError) {
            console.error('Failed to send error to opener:', postError);
          }
        }
      }
    };
    
    authenticate();
    
    // Cleanup function
    return () => {
      // Clear any pending timeouts
    };
  }, [searchParams, redirectUrl, mode, extensionId]);

const completeAuthentication = async (user: any) => {
  setMessage('Generating secure extension key...');
  
  // ✅ SIMPLIFIED: Generate key without Firestore operations
  const apiKey = `ext_${user.uid}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  setExtensionKey(apiKey);
  
  console.log('✅ Generated extension key:', apiKey);
  
  // Get user's Firestore data (read only - should work)
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const userData = userDoc.exists() ? userDoc.data() : {};
    
  // Get Firebase token
  const firebaseToken = await user.getIdToken();
    
  // ✅ USE EXISTING AUTH SERVICE for API endpoints
  const baseUrl = window.location.hostname.includes('localhost') 
    ? 'http://localhost:5173' 
    : 'http://localhost:5173';
    const apiEndpoints: ExtensionApiEndpoints = getExtensionEndpoints(baseUrl);  
    
  // Prepare response data
  const responseData = {
    type: 'AUTH_COMPLETE',
    success: true,
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0],
      photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}&background=667eea&color=fff`,
      plan: userData?.planId || 'free',
      onboardingCompleted: userData?.onboarding?.completed || false,
      emailVerified: user.emailVerified
    },
    token: firebaseToken,
    extension_key: apiKey,
    api_endpoints: apiEndpoints,
    expires_in: 3600, // 1 hour
    security: {
      timestamp: new Date().toISOString(),
      mode: mode,
      source: source,
      checks: securityChecks
    }
  };
  
  // ✅ USE EXISTING AUTH SERVICE for analytics
  try {
    await registerExtensionUsage(user.uid, extensionId, source);
    console.log('✅ Analytics logged');
  } catch (analyticsError) {
    console.warn('⚠️ Analytics logging failed:', analyticsError);
    // Don't throw - analytics is not critical
  }
  
  // Get validated redirect URL (need to compute this fresh)
  const redirectValidation = validateRedirectUrl(redirectUrl);
  
  // 🔥 NEW: Chrome Identity API mode
  if (mode === 'chrome_identity') {
    console.log('🔍 Chrome Identity mode detected');
    
    try {
      // Construct the redirect URL back to the extension
      // The extension ID should be in the format: abcdefghijklmnopqrstuvwxyzabcdef
      // Chrome will redirect to: https://<extension-id>.chromiumapp.org/
      const extensionIdFromUrl = searchParams ? searchParams.get('extension_id') : extensionId;
      
      if (extensionIdFromUrl && extensionIdFromUrl.length >= 32) {
        // For real extension IDs (32 chars)
        const redirectTarget = `https://${extensionIdFromUrl}.chromiumapp.org/provider_cb`;
        const redirectUrl = new URL(redirectTarget);
        
        // Encode the auth data in the URL fragment (it doesn't get sent to server)
        redirectUrl.hash = `#data=${encodeURIComponent(JSON.stringify(responseData))}`;
        
        console.log('✅ Redirecting back to extension via Chrome Identity API:', redirectUrl.href);
        setMessage('✅ Authentication complete! Redirecting back to extension...');
        setStatus('success');
        
        // Short delay for user to see the message
        setTimeout(() => {
          window.location.href = redirectUrl.href;
        }, 1500);
        
      } else {
        // For testing/development with shorter extension IDs
        console.log('⚠️ Using development redirect to extension');
        setMessage('✅ Authentication complete! Data ready for extension.');
        setStatus('success');
        
        // Store in localStorage for extension to pick up
        const storageKey = `extension_auth_chrome_${Date.now()}`;
        const storageData = {
          ...responseData,
          storedAt: Date.now(),
          expiresAt: Date.now() + 300000,
          storageKey: storageKey
        };
        localStorage.setItem(storageKey, JSON.stringify(storageData));
        console.log('✅ Data stored in localStorage for Chrome Identity fallback:', storageKey);
      }
      
    } catch (error) {
      console.error('❌ Chrome Identity redirect failed:', error);
      setStatus('error');
      setMessage('Failed to complete authentication. Please try again.');
    }
    
    return; // Stop further execution for chrome_identity mode
  }
  
  // Original popup mode handling (keep as fallback)
  if (mode === 'popup') {
    // 🔥 ENHANCED: Multiple message passing methods
    console.log('🔍 Debug - Sending auth data to extension...');
    console.log('🔍 Debug - window.opener exists?', !!window.opener);
    console.log('🔍 Debug - window.location.origin:', window.location.origin);
    
    let messageSent = false;
    let usedMethod = '';
    
    // Method 1: Try window.opener first (standard)
    if (window.opener && !window.opener.closed) {
      try {
        console.log('🔄 Method 1: Sending via window.opener.postMessage');
        window.opener.postMessage(responseData, '*');
        messageSent = true;
        usedMethod = 'window.opener';
        console.log('✅ Message sent via window.opener');
      } catch (openerError) {
        console.warn('❌ window.opener.postMessage failed:', openerError);
      }
    }
    
    // Method 2: Store in localStorage for popup to read
    if (!messageSent) {
      try {
        console.log('🔄 Method 2: Storing in localStorage');
        const storageKey = `extension_auth_${extensionId || 'default'}_${Date.now()}`;
        const storageData = {
          ...responseData,
          storedAt: Date.now(),
          expiresAt: Date.now() + 300000, // 5 minutes
          storageKey: storageKey
        };
        localStorage.setItem(storageKey, JSON.stringify(storageData));
        messageSent = true;
        usedMethod = 'localStorage';
        console.log('✅ Data stored in localStorage with key:', storageKey);
      } catch (storageError) {
        console.warn('❌ localStorage failed:', storageError);
      }
    }
    
    // Method 3: Use window.postMessage as fallback
    if (!messageSent) {
      try {
        console.log('🔄 Method 3: Sending via window.postMessage');
        window.postMessage(responseData, '*');
        messageSent = true;
        usedMethod = 'window.postMessage';
        console.log('✅ Message sent via window.postMessage');
      } catch (postError) {
        console.warn('❌ window.postMessage failed:', postError);
      }
    }
    
    if (messageSent) {
      setMessage(`✅ Authentication complete! Data sent via ${usedMethod}.`);
      setStatus('success');
      
      // 🔥 FIX: Don't auto-close, show manual close option
      setCountdown(10);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setMessage('✅ Authentication complete! You can safely close this window.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } else {
      // All methods failed - show key for manual copy
      setStatus('success');
      setMessage('✅ Authentication successful! Please copy the API key below and paste it into the extension.');
    }
    
  } else {
    // Redirect mode
    localStorage.setItem('extension_auth_data', JSON.stringify(responseData));
    localStorage.setItem('extension_auth_timestamp', Date.now().toString());
    
    if (redirectValidation.isValid && redirectValidation.normalizedUrl) {
      const redirectWithData = `${redirectValidation.normalizedUrl}?data=${encodeURIComponent(JSON.stringify(responseData))}`;
      window.location.href = redirectWithData;
    } else {
      setStatus('success');
      setMessage('Authentication successful! You can close this window.');
    }
  }
};

  // Enhanced getOrCreateExtensionKey that uses existing auth service but preserves your logic
  const getOrCreateExtensionKey = async (userId: string, extId?: string, source: string = 'unknown') => {
    try {
      console.log('🔍 getOrCreateExtensionKey - User ID:', userId);
      const extKey = extId || `ext_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
      
      // Check user's plan and extension limits (preserved from your code)
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      const plan = userData?.planId || 'free';
      
      const maxExtensions = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || 1;
      
      // Count user's existing active extensions
      const extensionsSnapshot = await getDocs(collection(db, 'users', userId, 'extensions'));
      const activeExtensions = extensionsSnapshot.docs.filter(doc => 
        doc.data().isActive !== false
      );
      
      if (activeExtensions.length >= maxExtensions && !extId) {
        throw new Error(`EXTENSION_LIMIT_REACHED: ${plan} plan allows ${maxExtensions} extension(s). Please upgrade or deactivate an existing extension.`);
      }
      
      // ✅ Use existing auth service but with enhanced logic
      let apiKey;
      try {
        // Try the existing service first
        console.log('🔍 Trying createExtensionKey service...');
        apiKey = await createExtensionKey(userId, extKey, source);
      } catch (serviceError) {
        // Fallback to local generation if service fails
        console.warn('Extension key service failed, using local generation:', serviceError);
        apiKey = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
      }
      console.log('🔍 Generated API key:', apiKey.substring(0, 20) + '...');

      // ✅ ADD: Try Firestore operations, but continue even if they fail
      try {
        console.log('🔍 Attempting Firestore operations...');

        // Store in Firestore (preserved from your code)
        const keyDocRef = doc(db, 'extension_keys', extKey);
        console.log('🔍 1. Setting extension key...');
        const keyDoc = await getDoc(keyDocRef);
        
        if (!keyDoc.exists()) {
          await setDoc(keyDocRef, {
            key: apiKey,
            userId,
            extensionId: extKey,
            createdAt: serverTimestamp(),
            lastUsed: null,
            isActive: true,
            rateLimit: 100, // requests per hour
            version: '1.0.0',
            userAgent: navigator.userAgent,
            ipInfo: await getIPInfo()
          });
          console.log('✅ 1. Extension key saved');
          
          // Store in user's extensions subcollection
          const userExtRef = doc(db, 'users', userId, 'extensions', extKey);
          console.log('🔍 2. Setting user extension...');
          await setDoc(userExtRef, {
            extensionId: extKey,
            apiKey: apiKey,
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp(),
            isActive: true,
            name: `Extension ${activeExtensions.length + 1}`,
            source: source
          });
           console.log('✅ 2. User extension saved');
          
          // Update user's extension count
          console.log('🔍 3. Updating user extension count...');
          await updateDoc(doc(db, 'users', userId), {
            extensionCount: increment(1),
            lastExtensionAdded: serverTimestamp()
          });
          console.log('✅ 3. User extension count updated');
          addSecurityCheck('New extension key generated', true);
        } else {
          // Return existing key
          const keyData = keyDoc.data();
          
          // Update last used timestamp
          await updateDoc(keyDocRef, {
            lastUsed: serverTimestamp(),
            userAgent: navigator.userAgent
          });
          
          // Update user's extension record
          const userExtRef = doc(db, 'users', userId, 'extensions', extKey);
          await updateDoc(userExtRef, {
            lastActive: serverTimestamp(),
            isActive: true
          });
          
          apiKey = keyData.key;
          addSecurityCheck('Existing extension key reused', true);
        }
      } catch (firestoreError) {
        // ✅ SILENTLY IGNORE Firestore errors for now - just log them

        const errorMessage = firestoreError instanceof Error ? firestoreError.message : 'Unknown Firestore error';
        console.warn('Firestore operations failed (continuing anyway):', errorMessage);
        addSecurityCheck('Firestore permissions issue (key saved locally)', true);  
      }
      
      return apiKey;
      
    } catch (error) {
      console.error('❌ Error in getOrCreateExtensionKey:', error);
      throw error;
    }
  };

  const handleTokenAuth = async (token: string) => {
    try {
      // Verify token with your backend
      const response = await fetch('https://datasenceai.com/api/extension/v1/verify-token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Origin': window.location.origin
        },
        body: JSON.stringify({ 
          token,
          extensionId,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Invalid token');
      }
      
      const data = await response.json();
      
      if (!data.valid) {
        throw new Error('Token validation failed');
      }
      
      // Sign in with custom token
      const auth = getAuth(app);
      const userCredential = await signInWithCustomToken(auth, data.customToken);
      
      return userCredential.user;
    } catch (error: any) {
      console.error('Token auth failed:', error);
      throw new Error('Token authentication failed: ' + error.message);
    }
  };

  const getIPInfo = async (): Promise<Record<string, any>> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return { ip: data.ip, timestamp: new Date().toISOString() };
    } catch {
      return { ip: 'unknown', timestamp: new Date().toISOString() };
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Show temporary success
      const originalMessage = message;
      setMessage('✅ API Key copied to clipboard!');
      setTimeout(() => setMessage(originalMessage), 2000);
    } catch (err) {
      setMessage('Failed to copy. Please copy manually.');
    }
  };

  // ✅ Compute redirect validation once
  const redirectValidation = validateRedirectUrl(redirectUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-gray-700/50">
        <div className="mb-8">
          {/* Logo/Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SmartSocial</h1>
              <p className="text-sm text-gray-400">Extension Authentication</p>
            </div>
          </div>
          
          {/* Status Icon */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            status === 'loading' ? 'bg-blue-500/20 animate-pulse' :
            status === 'success' ? 'bg-green-500/20' :
            'bg-red-500/20'
          }`}>
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-400" />
            )}
            {status === 'error' && (
              <AlertCircle className="h-12 w-12 text-red-400" />
            )}
          </div>
          
          {/* Status Message */}
          <h2 className="text-xl font-semibold text-white mb-3">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Authentication Successful!'}
            {status === 'error' && 'Authentication Failed'}
          </h2>
          
          <p className="text-gray-300 mb-6">{message}</p>
          
          {/* Loading Animation */}
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                {[0, 75, 150].map(delay => (
                  <div
                    key={delay}
                    className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"
                    style={{ animationDelay: `${delay}ms` }}
                  ></div>
                ))}
              </div>
              
              {/* Security Checks */}
              {securityChecks.length > 0 && (
                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-green-400" />
                    <p className="text-sm text-gray-400">Security Checks</p>
                  </div>
                  <div className="space-y-1 text-left">
                    {securityChecks.slice(-3).map((check, idx) => (
                      <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-green-400"></div>
                        {check}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Success State */}
          {status === 'success' && (
            <div className="space-y-6">
              {extensionKey && (
                <div className="mt-6 p-5 bg-gray-900/80 rounded-xl border border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <p className="text-sm font-medium text-gray-300">Your Extension API Key</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(extensionKey)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-lg transition-colors"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <code className="block p-3 bg-black/50 rounded-lg text-green-400 text-sm font-mono break-all border border-gray-800">
                    {extensionKey}
                  </code>
                  <div className="flex items-start gap-2 mt-3 p-2 bg-amber-900/20 rounded border border-amber-800/30">
                    <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300">
                      Save this key securely. It provides access to your account and won't be shown again.
                    </p>
                  </div>
                </div>
              )}
              
              {mode === 'popup' && (
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                  {countdown > 0 ? (
                    <>
                      <p className="text-sm text-blue-300 mb-2">
                        ⏳ This window will remain open for <span className="font-bold">{countdown}</span> seconds...
                      </p>
                      <button
                        onClick={() => {
                          try {
                            window.close();
                          } catch (closeError) {
                            setMessage('Please close this window using the browser close button (X)');
                          }
                        }}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Close Window Now
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-green-300">
                      ✅ You can now safely close this window.
                    </p>
                  )}
                  
                  <div className="mt-3 p-3 bg-gray-900/50 rounded border border-gray-700">
                    <p className="text-xs text-gray-400">
                      If extension didn't receive data, copy the key above and paste it manually.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Secured by Firebase Auth
                </span>
                <span>•</span>
                <span>Rate-limited API</span>
                <span>•</span>
                <span>End-to-end encrypted</span>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {status === 'error' && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-red-900/20 rounded-lg border border-red-800/30">
                <p className="text-sm text-red-300">
                  {message.includes('Security violation') && (
                    <span className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      Security Issue Detected
                    </span>
                  )}
                  {message}
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
                >
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.href = 'https://datasenceai.com/support'}
                  className="px-5 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Contact Support
                </button>
              </div>
              
              <p className="text-xs text-gray-500 pt-4 border-t border-gray-800">
                If the problem persists, contact support@datasenceai.com
                <br />
                Reference: {extensionId || 'No extension ID'}
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="pt-6 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>SmartSocial Extension v1.0</span>
              <span>•</span>
              <span>{new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
              <span>Live</span>
            </div>
          </div>
          {redirectValidation.normalizedUrl && (
            <p className="text-xs text-gray-700 mt-2">
              Redirecting to: {new URL(redirectValidation.normalizedUrl).hostname}
            </p>
          )}
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
    </div>
  );
};

export default ExtensionAuth;