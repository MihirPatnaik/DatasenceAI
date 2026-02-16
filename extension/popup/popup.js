// SmartSocial Chrome Extension - Popup Controller

class SmartSocialExtension {
  constructor() {
    this.authState = {
      isAuthenticated: false,
      user: null,
      token: null,
      extensionKey: null,
      apiEndpoints: null
    };
    
    this.init();
  }

  async init() {
    console.log('🔧 Initializing SmartSocial extension...');
    
    try {
      await this.loadAuthState();
      this.render();
      this.setupEventListeners();
      
      if (this.authState.isAuthenticated) {
        this.scheduleTokenRefresh();
        await this.checkApiHealth();
      }
    } catch (error) {
      console.error('Initialization failed:', error);
      this.showToast('Failed to initialize extension', 'error');
    }
  }

  async loadAuthState() {
    return new Promise((resolve) => {
      chrome.storage.local.get([
        'extension_auth_user',
        'extension_auth_token', 
        'extension_api_key',
        'extension_api_endpoints'
      ], (data) => {
        console.log('📦 Loading auth state from storage:', data.extension_auth_user ? 'User found' : 'No user');
        
        this.authState = {
          isAuthenticated: !!data.extension_auth_token && !!data.extension_auth_user,
          user: data.extension_auth_user ? JSON.parse(data.extension_auth_user) : null,
          token: data.extension_auth_token || null,
          extensionKey: data.extension_api_key || null,
          apiEndpoints: data.extension_api_endpoints ? JSON.parse(data.extension_api_endpoints) : {
            caption: 'https://datasenceai.com/api/extension/v1/linkedin/caption',
            quota: 'https://datasenceai.com/api/extension/v1/quota',
            track: 'https://datasenceai.com/api/extension/v1/track'
          }
        };
        resolve();
      });
    });
  }

  saveAuthState() {
    chrome.storage.local.set({
      extension_auth_user: JSON.stringify(this.authState.user),
      extension_auth_token: this.authState.token,
      extension_api_key: this.authState.extensionKey,
      extension_api_endpoints: JSON.stringify(this.authState.apiEndpoints)
    });
    console.log('💾 Auth state saved');
  }

  clearAuthState() {
    chrome.storage.local.remove([
      'extension_auth_user',
      'extension_auth_token',
      'extension_api_key',
      'extension_api_endpoints'
    ]);
    this.authState = {
      isAuthenticated: false,
      user: null,
      token: null,
      extensionKey: null,
      apiEndpoints: null
    };
    console.log('🧹 Auth state cleared');
  }

  async login() {
    console.log('🔑 Starting Chrome Identity OAuth...');
    
    try {
      // Get extension ID from manifest or runtime
      const extensionId = chrome.runtime.id;
      console.log('🔍 Extension ID:', extensionId);
      
      // Construct the auth URL for your web app
      const authUrl = new URL('http://localhost:5173/smartsocial/extension-auth');
      authUrl.searchParams.set('mode', 'chrome_identity');
      authUrl.searchParams.set('extension_id', extensionId);
      authUrl.searchParams.set('redirect', 'extension');
      authUrl.searchParams.set('source', 'chrome_extension');
      
      console.log('🔄 Launching Chrome Identity auth flow:', authUrl.href);
      
      // Use Chrome's built-in identity API (more reliable than window.open)
      const redirectUrl = await chrome.identity.launchWebAuthFlow({
        url: authUrl.href,
        interactive: true
      });
      
      console.log('✅ Auth flow completed, redirect URL:', redirectUrl);
      
      // Parse the data from the redirect URL
      const urlObj = new URL(redirectUrl);
      const hashFragment = urlObj.hash.substring(1); // Remove the # symbol
      
      if (hashFragment.includes('data=')) {
        const encodedData = hashFragment.split('data=')[1];
        if (encodedData) {
          try {
            const authData = JSON.parse(decodeURIComponent(encodedData));
            
            if (authData.type === 'AUTH_COMPLETE' && authData.success) {
              console.log('✅ Auth successful via Chrome Identity:', authData.user.email);
              
              this.authState = {
                isAuthenticated: true,
                user: authData.user,
                token: authData.token,
                extensionKey: authData.extension_key,
                apiEndpoints: authData.api_endpoints || this.authState.apiEndpoints
              };
              
              this.saveAuthState();
              this.render();
              
              this.showToast(`Welcome ${authData.user.displayName || authData.user.email}!`, 'success');
              return;
            }
          } catch (parseError) {
            console.error('❌ Failed to parse auth data:', parseError);
          }
        }
      }
      
      // Fallback: Check localStorage for data
      console.log('🔄 Checking localStorage for auth data...');
      await this.checkLocalStorageForAuth();
      
    } catch (error) {
      console.error('❌ Chrome identity auth failed:', error);
      
      // Fallback to old method if Chrome Identity fails
      if (error.message.includes('No matching auth flow')) {
        console.log('🔄 Falling back to popup method...');
        await this.loginWithPopup();
      } else {
        this.showToast('Login failed: ' + error.message, 'error');
      }
    }
  }

  // Fallback method using popup (original method)
  async loginWithPopup() {
    console.log('🔑 Starting OAuth login with popup...');
    
    // Generate unique extension ID
    const extensionId = 'ext_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // ✅ FIXED: Correct OAuth URL with /smartsocial/ path
    const oauthUrl = new URL('http://localhost:5173/smartsocial/extension-auth');
    oauthUrl.searchParams.set('mode', 'popup');
    oauthUrl.searchParams.set('extension_id', extensionId);
    oauthUrl.searchParams.set('redirect', 'extension');
    
    // Open popup window
    const width = 500;
    const height = 700;
    const left = Math.round((screen.width - width) / 2);
    const top = Math.round((screen.height - height) / 2);
    
    const authWindow = window.open(
      oauthUrl.toString(),
      'SmartSocial Auth',
      `width=${width},height=${height},left=${left},top=${top},popup=yes`
    );

    if (!authWindow) {
      this.showToast('Popups are blocked! Please allow popups for this site.', 'error');
      return;
    }

    this.showToast('Opening login window...', 'info');

    // Listen for auth response from the web app
    const messageHandler = (event) => {
      // Security: Only accept messages from our domains
      const allowedOrigins = ['http://localhost:5173', 'https://datasenceai.com'];
      if (!allowedOrigins.includes(event.origin)) {
        console.warn('Message from unauthorized origin:', event.origin);
        return;
      }
      
      if (event.data.type === 'AUTH_COMPLETE' && event.data.success) {
        console.log('✅ Auth successful:', event.data.user.email);
        
        this.authState = {
        isAuthenticated: false,
        user: null,
        token: null,
        extensionKey: null,
        apiEndpoints: {
          // CHANGE THESE TO LOCALHOST
          caption: 'http://localhost:5173/api/extension/v1/linkedin/caption',
          quota: 'http://localhost:5173/api/extension/v1/quota',
          track: 'http://localhost:5173/api/extension/v1/track',
          health: 'http://localhost:5173/api/health'
        }
      };
        
        this.saveAuthState();
        this.render();
        
        if (authWindow) {
          try {
            authWindow.close();
          } catch (e) {
            console.log('Could not close auth window');
          }
        }
        
        // Remove listener
        window.removeEventListener('message', messageHandler);
        
        this.showToast(`Welcome ${event.data.user.displayName || event.data.user.email}!`, 'success');
      }
      
      if (event.data.type === 'AUTH_ERROR') {
        console.error('Auth error:', event.data.error);
        this.showToast(`Login failed: ${event.data.error}`, 'error');
        window.removeEventListener('message', messageHandler);
      }
    };

    window.addEventListener('message', messageHandler);

    // Fallback: Check if window closed without auth
    const checkWindow = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkWindow);
        window.removeEventListener('message', messageHandler);
        console.log('Auth window closed by user');
        
        // Check localStorage as fallback
        setTimeout(() => {
          this.checkLocalStorageForAuth();
        }, 500);
      }
    }, 1000);
  }

  // Helper method to check localStorage for auth data
  async checkLocalStorageForAuth() {
    console.log('🔍 Checking localStorage for auth data...');
    
    // Check for Chrome Identity stored data
    const chromeKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('extension_auth_chrome_')
    );
    
    // Check for regular stored data
    const regularKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('extension_auth_') && !key.includes('chrome_')
    );
    
    const allKeys = [...chromeKeys, ...regularKeys];
    
    for (const key of allKeys) {
      try {
        const storedData = JSON.parse(localStorage.getItem(key));
        
        // Check if data is still valid (not expired)
        if (storedData && storedData.expiresAt > Date.now()) {
          console.log('✅ Found valid auth data in localStorage:', key);
          
          if (storedData.type === 'AUTH_COMPLETE' && storedData.success) {
            this.authState = {
              isAuthenticated: true,
              user: storedData.user,
              token: storedData.token,
              extensionKey: storedData.extension_key,
              apiEndpoints: storedData.api_endpoints || this.authState.apiEndpoints
            };
            
            this.saveAuthState();
            this.render();
            
            // Clean up
            localStorage.removeItem(key);
            
            this.showToast(`Welcome ${storedData.user.displayName || storedData.user.email}! (via localStorage)`, 'success');
            return true;
          }
        } else if (storedData && storedData.expiresAt <= Date.now()) {
          // Remove expired data
          localStorage.removeItem(key);
          console.log('🧹 Removed expired auth data:', key);
        }
      } catch (error) {
        console.warn('Error parsing localStorage data:', key, error);
        localStorage.removeItem(key); // Clean up corrupted data
      }
    }
    
    return false;
  }

  async logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.clearAuthState();
      this.render();
      this.showToast('Logged out successfully', 'info');
    }
  }

  async enhanceLinkedInPost() {
    if (!this.authState.isAuthenticated) {
      this.showToast('Please login first', 'error');
      return;
    }

    this.showToast('Looking for LinkedIn...', 'info');

    // Get current active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    if (!currentTab?.url?.includes('linkedin.com')) {
      this.showToast('Please open LinkedIn first', 'warning');
      
      if (confirm('Open LinkedIn in a new tab?')) {
        chrome.tabs.create({ url: 'https://linkedin.com' });
      }
      return;
    }

    try {
      // Send message to content script
      chrome.tabs.sendMessage(currentTab.id, {
        type: 'ENHANCE_POST',
        credentials: {
          token: this.authState.token,
          extensionKey: this.authState.extensionKey,
          apiEndpoint: this.authState.apiEndpoints?.caption
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Content script error:', chrome.runtime.lastError);
          this.showToast('LinkedIn page not ready. Try refreshing the page.', 'error');
        } else if (response?.success) {
          this.showToast('Enhancement triggered! Check LinkedIn page.', 'success');
          this.trackUsage('enhance_linkedin_post');
        } else {
          this.showToast('Failed to enhance post', 'error');
        }
      });
    } catch (error) {
      console.error('Enhancement failed:', error);
      this.showToast('Failed to connect to LinkedIn', 'error');
    }
  }

async getQuota() {
  try {
    const response = await fetch(this.authState.apiEndpoints.quota, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.authState.token}`,
        'X-Extension-Key': this.authState.extensionKey,
        'X-User-ID': this.authState.user.uid,
        'Accept': 'application/json'
      },
      mode: 'cors'  // Add this for localhost
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Quota API success:', data);
      return data;
    }
    
    // Fallback to mock
    return this.getMockQuotaData();
    
  } catch (error) {
    console.error('Quota fetch failed, using mock:', error);
    return this.getMockQuotaData();
  }
}

// Add this helper method
getMockQuotaData() {
  return {
    used: 3,
    limit: 20,
    remaining: 17,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    plan: this.authState.user?.plan || 'pro'
  };
}
  async checkApiHealth() {
    try {
      const response = await fetch('https://datasenceai.com/api/health', {
        method: 'GET',
        headers: {
          'X-Extension-Key': this.authState.extensionKey
        }
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async trackUsage(action) {
    if (!this.authState.isAuthenticated || !this.authState.apiEndpoints?.track) {
      return;
    }
    
    try {
      await fetch(this.authState.apiEndpoints.track, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authState.token}`,
          'X-Extension-Key': this.authState.extensionKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.authState.user.uid,
          action: action,
          timestamp: new Date().toISOString(),
          source: 'chrome_extension',
          version: '1.0.0'
        })
      });
    } catch (error) {
      console.warn('Failed to track usage:', error);
    }
  }

  scheduleTokenRefresh() {
    // Refresh token every 45 minutes
    setInterval(async () => {
      if (this.authState.isAuthenticated) {
        console.log('🔄 Token refresh scheduled');
        // In production, call your refresh endpoint
        // await this.refreshToken();
      }
    }, 45 * 60 * 1000);
  }

  showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  render() {
    const app = document.getElementById('app');
    
    if (!app) {
      console.error('App container not found');
      return;
    }
    
    if (!this.authState.isAuthenticated) {
      app.innerHTML = this.renderLoginScreen();
    } else {
      app.innerHTML = this.renderDashboard();
      
      // Load quota data asynchronously
      this.loadQuotaData();
    }
  }

  renderLoginScreen() {
    return `
      <div class="auth-container">
        <div class="header">
          <div class="logo">🤖</div>
          <h1>SmartSocial AI</h1>
          <p class="subtitle">Your AI-powered social media assistant<br>Generate better content in seconds</p>
        </div>
        
        <div class="features">
          <div class="feature">
            <span>✨</span>
            <div class="feature-content">
              <h3>AI-Powered Enhancements</h3>
              <p>Transform ordinary posts into engaging content with AI suggestions</p>
            </div>
          </div>
          
          <div class="feature">
            <span>🚀</span>
            <div class="feature-content">
              <h3>One-Click Optimization</h3>
              <p>Enhance LinkedIn posts instantly while you write them</p>
            </div>
          </div>
          
          <div class="feature">
            <span>📊</span>
            <div class="feature-content">
              <h3>Smart Analytics</h3>
              <p>Track your usage and get personalized insights</p>
            </div>
          </div>
        </div>
        
        <button id="login-btn" class="btn-login">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
        
        <div class="footer">
          <p>By continuing, you agree to our <a href="https://datasenceai.com/terms" target="_blank">Terms</a> and <a href="https://datasenceai.com/privacy" target="_blank">Privacy Policy</a></p>
          <p class="version">v1.0.0 • Chrome Extension</p>
        </div>
      </div>
    `;
  }

  renderDashboard() {
    const user = this.authState.user;
    const displayName = user.displayName || 'User';
    const email = user.email || 'No email';
    const plan = user.plan || 'free';
    const photoURL = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=100`;
    
    return `
      <div class="dashboard">
        <div class="user-header">
          <img src="${photoURL}" alt="Profile" class="avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff'">
          <div class="user-info">
            <h2>${displayName}</h2>
            <p class="email">${email}</p>
            <span class="plan-badge plan-${plan}">${plan.toUpperCase()} PLAN</span>
          </div>
          <button id="logout-btn" class="btn-icon" title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
        
        <div class="quick-actions">
          <h3>⚡ Quick Actions</h3>
          <button id="enhance-linkedin" class="action-btn">
            <span class="icon">🤖</span>
            <div class="action-content">
              <strong>Enhance LinkedIn Post</strong>
              <small>Open LinkedIn and click to enhance your current post</small>
            </div>
            <span class="arrow">→</span>
          </button>
          
          <button id="generate-caption" class="action-btn">
            <span class="icon">✨</span>
            <div class="action-content">
              <strong>Generate Caption</strong>
              <small>Create AI-powered captions for any platform</small>
            </div>
            <span class="arrow">→</span>
          </button>
          
          <button id="open-dashboard" class="action-btn">
            <span class="icon">📊</span>
            <div class="action-content">
              <strong>Open Web Dashboard</strong>
              <small>Access full analytics & settings</small>
            </div>
            <span class="arrow">→</span>
          </button>
        </div>
        
        <div class="stats-section">
          <h3>📈 Usage & Quota</h3>
          <div id="quota-display" class="quota-display">
            <div class="loader" style="margin: 20px auto;"></div>
            <p style="text-align: center; color: #6b7280; font-size: 14px;">Loading quota information...</p>
          </div>
        </div>
        
        <div class="api-info">
          <h4>🔐 API Status</h4>
          <div class="status-item">
            <span class="status-dot active"></span>
            <span>Authentication: <strong>Active</strong></span>
          </div>
          <div class="status-item">
            <span class="status-dot active"></span>
            <span>Extension Key: <code class="api-key">${this.authState.extensionKey?.substring(0, 12)}...</code></span>
          </div>
          <button id="copy-key" class="btn-small">Copy API Key</button>
        </div>
      </div>
    `;
  }

async loadQuotaData() {
  const quotaDisplay = document.getElementById('quota-display');
  if (!quotaDisplay) return;
  
  const quota = await this.getQuota();
  
  if (quota) {
    const used = quota.used || 0;
    const limit = quota.limit || 20;
    const percentage = Math.min((used / limit) * 100, 100);
    const remaining = Math.max(limit - used, 0);
    const resetDate = quota.resetDate ? new Date(quota.resetDate).toLocaleDateString() : 'End of month';
    
    quotaDisplay.innerHTML = `
      <div class="quota-meter">
        <div class="meter-bar" style="width: ${percentage}%"></div>
      </div>
      <div class="quota-numbers">
        <div class="quota-item">
          <span class="number">${used}</span>
          <span class="label">Used</span>
        </div>
        <div class="quota-item">
          <span class="number">${remaining}</span>
          <span class="label">Remaining</span>
        </div>
        <div class="quota-item">
          <span class="number">${limit}</span>
          <span class="label">Total</span>
        </div>
      </div>
      <p class="quota-period">Resets on ${resetDate}</p>
      ${quota.mock ? '<small style="color: #6b7280; font-size: 10px;">⚠️ Using demo data</small>' : ''}
    `;
  } else {
    quotaDisplay.innerHTML = `
      <div class="quota-error">
        <p>Unable to load quota data</p>
        <small>Check your connection or refresh</small>
      </div>
    `;
  }
}

  setupEventListeners() {
    // Use event delegation for dynamic content
    document.addEventListener('click', async (e) => {
      const button = e.target.closest('button');
      if (!button) return;
      
      const id = button.id;
      
      switch (id) {
        case 'login-btn':
          await this.login();
          break;
          
        case 'logout-btn':
          await this.logout();
          break;
          
        case 'enhance-linkedin':
          await this.enhanceLinkedInPost();
          break;
          
        case 'generate-caption':
          this.showToast('Caption generation coming soon!', 'info');
          break;
          
        case 'open-dashboard':
          chrome.tabs.create({ 
            url: 'https://datasenceai.com/dashboard',
            active: true 
          });
          break;
          
        case 'copy-key':
          if (this.authState.extensionKey) {
            try {
              await navigator.clipboard.writeText(this.authState.extensionKey);
              this.showToast('API key copied to clipboard', 'success');
            } catch (err) {
              this.showToast('Failed to copy key', 'error');
            }
          }
          break;
          
        default:
          console.log('Unhandled button click:', id);
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Starting SmartSocial extension...');
  window.smartsocial = new SmartSocialExtension();
});

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});