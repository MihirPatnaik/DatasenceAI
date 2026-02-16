// datasenceai/extension/content/linkedin.js
// LinkedIn Automation Script with PHANTOM FILL
// UPDATED VERSION WITH IMMEDIATE PHANTOM FIX

console.log('🤖 SmartSocial LinkedIn Assistant loaded');

// 🚨 CRITICAL FIX: IMMEDIATE PHANTOM FILL CHECK
(function immediatePhantomCheck() {
  console.log('⚡ IMMEDIATE PHANTOM FILL CHECK ON SCRIPT LOAD');
  
  // Check URL immediately
  const urlParams = new URLSearchParams(window.location.search);
  const phantomId = urlParams.get('smartsocial');
  
  // Also check hash fragment
  const hashMatch = window.location.hash.match(/smartsocial=([^&]+)/);
  const hashPhantomId = hashMatch ? hashMatch[1] : null;
  
  const detectedId = phantomId || hashPhantomId;
  
  if (detectedId && detectedId.startsWith('phantom_')) {
    console.log('🎯 IMMEDIATE DETECTION: Phantom ID found!', detectedId);
    
    // Store for later processing by the class
    window.__PHANTOM_ID = detectedId;
    window.__PHANTOM_DETECTED_AT = Date.now();
    
    // Clean URL immediately to prevent issues
    try {
      const cleanUrl = new URL(window.location);
      cleanUrl.searchParams.delete('smartsocial');
      
      // Clean hash if present
      const cleanHash = window.location.hash.replace(/[?&]smartsocial=[^&]+/, '');
      cleanUrl.hash = cleanHash || '';
      
      window.history.replaceState({}, '', cleanUrl.toString());
      console.log('✅ URL cleaned immediately');
    } catch (error) {
      console.error('Error cleaning URL:', error);
    }
  } else {
    console.log('ℹ️ No phantom parameter in immediate check');
  }
})();

class LinkedInAssistant {
  constructor() {
    this.isProcessing = false;
    this.isEnhancing = false;
    this.isPhantomProcessing = false; // Prevent race conditions
    this.authToken = null;
    this.extensionKey = null;
    this.currentPost = null;
    
    // PHANTOM FILL INITIALIZATION
    this.phantomPostId = null;
    this.lastUrl = null;
    this.initialized = false;
    
    // 🆕 CRITICAL: Check for stored phantom ID immediately
    if (window.__PHANTOM_ID) {
      console.log('🚨 PROCESSING STORED PHANTOM ID FROM IMMEDIATE CHECK:', window.__PHANTOM_ID);
      this.phantomPostId = window.__PHANTOM_ID;
      this.isPhantomProcessing = true;
      
      // Mark that we're processing this
      sessionStorage.setItem('processing_phantom', window.__PHANTOM_ID);
      
      // Start phantom fill after a short delay
      setTimeout(() => {
        console.log('🚀 Starting delayed phantom fill for stored ID');
        this.fillPhantomPost(window.__PHANTOM_ID);
      }, 800);
    }
    
    this.initialize();
    
    // 🆕 EXTRA SAFETY: Force check in case initialization missed something
    setTimeout(() => {
      if (this.initialized && !this.isPhantomProcessing) {
        console.log('🔄 Extra safety Phantom Fill check...');
        this.checkForPhantomFillImmediate();
      }
    }, 3000);
  }

  // ====================
  // INITIALIZATION
  // ====================
  async initialize() {
    if (this.initialized) {
      console.log('⚠️ Assistant already initialized');
      return;
    }
    
    console.log('🔄 Initializing LinkedIn Assistant...');
    
    // 🆕 CRITICAL: Run immediate phantom check FIRST
    console.log('🚨 RUNNING IMMEDIATE PHANTOM CHECK IN INITIALIZE');
    this.checkForPhantomFillImmediate();
    
    // Load auth data
    await this.loadAuthData();
    
    // Setup message listeners
    this.setupMessageListeners();
    
    // Setup mutation observer
    this.setupMutationObserver();
    
    // Inject AI enhancement buttons
    setTimeout(() => this.injectEnhancementButtons(), 2000);
    
    console.log('✅ LinkedIn Assistant initialized');
    this.initialized = true;
  }

  // ====================
  // 🆕 IMMEDIATE PHANTOM FILL METHOD
  // ====================
  
  checkForPhantomFillImmediate() {
    console.log('🔍 IMMEDIATE Phantom Fill check running');
    
    // If already processing, skip
    if (this.isPhantomProcessing) {
      console.log('⚠️ Phantom fill already in progress');
      return false;
    }
    
    // Check URL for phantom parameter
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('smartsocial');
    
    // Also check hash fragment
    const hashMatch = window.location.hash.match(/smartsocial=([^&]+)/);
    const hashPostId = hashMatch ? hashMatch[1] : null;
    
    const phantomId = postId || hashPostId || window.__PHANTOM_ID;
    
    if (phantomId && phantomId.startsWith('phantom_')) {
      console.log('🎯 IMMEDIATE PHANTOM FILL TRIGGERED:', phantomId);
      
      this.phantomPostId = phantomId;
      this.isPhantomProcessing = true;
      
      // Store that we're processing this
      sessionStorage.setItem('processing_phantom', phantomId);
      
      // Clean URL immediately
      this.cleanUrlParameters();
      
      // Process with slight delay to ensure page is ready
      setTimeout(() => {
        console.log('🚀 Starting phantom fill from immediate check');
        this.fillPhantomPost(phantomId);
      }, 1000);
      
      return true;
    }
    
    console.log('ℹ️ No phantom parameter found in immediate check');
    return false;
  }

  // ====================
  // EXISTING PHANTOM FILL SECTION
  // ====================
  
  checkForPhantomFill() {
    // Prevent multiple concurrent phantom fill operations
    if (this.isPhantomProcessing) {
      console.log('⚠️ Phantom fill already in progress');
      return false;
    }
    
    console.log('🔍 Checking for Phantom Fill...');
    
    // Check URL for phantom parameter
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('smartsocial');
    
    // Also check hash fragment
    const hashMatch = window.location.hash.match(/smartsocial=([^&]+)/);
    const hashPostId = hashMatch ? hashMatch[1] : null;
    
    const phantomId = postId || hashPostId;
    
    if (phantomId && phantomId.startsWith('phantom_')) {
      console.log('🎯 PHANTOM FILL DETECTED! Post ID:', phantomId);
      
      this.phantomPostId = phantomId;
      this.isPhantomProcessing = true;
      
      // Store that we're processing this
      sessionStorage.setItem('processing_phantom', phantomId);
      
      // Clean URL immediately
      this.cleanUrlParameters();
      
      // Wait for LinkedIn to fully load
      setTimeout(() => {
        this.fillPhantomPost(phantomId);
      }, 1500);
      
      return true;
    }
    
    console.log('ℹ️ No phantom parameter found');
    return false;
  }

  // CLEAN URL PARAMETERS
  cleanUrlParameters() {
    try {
      const url = new URL(window.location);
      url.searchParams.delete('smartsocial');
      
      // Clean hash if present
      const cleanHash = window.location.hash.replace(/[?&]smartsocial=[^&]+/, '');
      url.hash = cleanHash || '';
      
      window.history.replaceState({}, '', url.toString());
      console.log('🧹 URL cleaned');
    } catch (error) {
      console.error('Error cleaning URL:', error);
    }
  }

  // FILL PHANTOM POST
  async fillPhantomPost(postId) {
    console.log('🔍 Loading phantom post:', postId);
    
    try {
      // Check localStorage first (from web app)
      const storageKey = `smartsocial_${postId}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        console.log('📦 Found in localStorage');
        const phantomData = JSON.parse(storedData);
        await this.fillWithPhantomData(phantomData);
        localStorage.removeItem(storageKey);
        this.isPhantomProcessing = false;
        delete window.__PHANTOM_ID;
        return;
      }
      
      // Check chrome.storage (from extension messaging)
      if (chrome?.storage?.local) {
        chrome.storage.local.get([storageKey], (result) => {
          if (result[storageKey]) {
            console.log('📦 Found in chrome.storage');
            this.fillWithPhantomData(result[storageKey]);
            chrome.storage.local.remove([storageKey]);
          } else {
            console.log('❌ No phantom data found');
            this.showNotification('No post data found. Please try again.', 'error');
          }
          this.isPhantomProcessing = false;
          delete window.__PHANTOM_ID;
        });
      } else {
        console.log('❌ No post data found');
        this.showNotification('No post data found. Please try again.', 'error');
        this.isPhantomProcessing = false;
        delete window.__PHANTOM_ID;
      }
    } catch (error) {
      console.error('Failed to load phantom post:', error);
      this.showNotification('Failed to load post. Please try again.', 'error');
      this.isPhantomProcessing = false;
      delete window.__PHANTOM_ID;
    }
  }

  // FILL WITH PHANTOM DATA
  async fillWithPhantomData(phantomData) {
    console.log('✨ Filling with phantom data');
    
    const maxAttempts = 15;
    const attemptInterval = 500;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const composer = this.getLinkedInComposer();
      
      if (composer) {
        console.log('✅ Found LinkedIn composer!');
        
        // Focus the editor
        composer.focus();
        
        // Clear any existing content
        composer.innerHTML = '';
        
        // Fill with typing animation
        await this.simpleTypeAnimation(composer, phantomData);
        
        // Show success notification
        this.showNotification(
          '✨ Your SmartSocial post is ready! Review and click "Post"',
          'success'
        );
        
        // Clean up storage
        this.cleanupPhantomStorage(phantomData.id);
        this.isPhantomProcessing = false;
        delete window.__PHANTOM_ID;
        return;
      }
      
      console.log(`⏳ Waiting for LinkedIn composer... attempt ${attempt}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, attemptInterval));
    }
    
    console.log('❌ Could not find LinkedIn composer after multiple attempts');
    this.showNotification(
      'Could not find post editor. Please refresh LinkedIn and try again.',
      'error'
    );
    this.isPhantomProcessing = false;
    delete window.__PHANTOM_ID;
  }

  // SIMPLE TYPING ANIMATION FOR PHANTOM FILL
  async simpleTypeAnimation(element, phantomData) {
    const fullText = phantomData.postData?.caption || phantomData.caption || '';
    const hashtags = phantomData.postData?.hashtags || phantomData.hashtags || '';
    
    const textToType = fullText + (hashtags ? `\n\n${hashtags}` : '');
    
    return new Promise((resolve) => {
      let i = 0;
      
      const typeChar = () => {
        if (i < textToType.length) {
          const char = textToType.charAt(i);
          
          // Add character
          element.textContent += char;
          
          // Scroll to keep cursor visible
          element.scrollTop = element.scrollHeight;
          
          i++;
          
          // Natural typing speed
          const delay = 30 + (Math.random() * 40);
          
          setTimeout(typeChar, delay);
        } else {
          console.log('✅ Phantom fill complete!');
          
          // Add subtle highlight effect
          element.style.transition = 'background-color 0.5s';
          element.style.backgroundColor = 'rgba(147, 197, 253, 0.1)';
          
          setTimeout(() => {
            element.style.backgroundColor = '';
          }, 1000);
          
          resolve();
        }
      };
      
      typeChar();
    });
  }

  // GET LINKEDIN COMPOSER
  getLinkedInComposer() {
    // Strategy 1: Look for contenteditable areas in modal
    const modals = document.querySelectorAll('[role="dialog"], .artdeco-modal');
    for (const modal of modals) {
      const editor = modal.querySelector('[contenteditable="true"]');
      if (editor) return editor;
    }
    
    // Strategy 2: Look for share box
    const shareBox = document.querySelector('.share-box, [data-test-share-box]');
    if (shareBox) {
      const editor = shareBox.querySelector('[contenteditable="true"]');
      if (editor) return editor;
    }
    
    // Strategy 3: Look for any contenteditable in feed
    const feedEditors = document.querySelectorAll('.feed-shared-update-v2 [contenteditable="true"]');
    if (feedEditors.length > 0) return feedEditors[0];
    
    // Strategy 4: Common selectors
    const commonSelectors = [
      '.ql-editor[contenteditable="true"]',
      '[role="textbox"][contenteditable="true"]',
      '[data-test-share-box-content]',
      '.share-box__textarea',
      'div[contenteditable="true"]'
    ];
    
    for (const selector of commonSelectors) {
      const element = document.querySelector(selector);
      if (element && element.isContentEditable) {
        return element;
      }
    }
    
    return null;
  }

  // CLEANUP PHANTOM STORAGE
  cleanupPhantomStorage(postId) {
    try {
      localStorage.removeItem(`smartsocial_${postId}`);
      sessionStorage.removeItem('processing_phantom');
      
      if (chrome?.storage?.local) {
        chrome.storage.local.remove([postId, `smartsocial_${postId}`]);
      }
      
      console.log('🧹 Cleaned up phantom storage');
    } catch (error) {
      console.error('Error cleaning storage:', error);
    }
  }

  // ====================
  // CORE FUNCTIONALITY (UNCHANGED)
  // ====================
  
  async loadAuthData() {
    try {
      const data = await chrome.storage.local.get([
        'extension_auth_token',
        'extension_api_key'
      ]);
      
      this.authToken = data.extension_auth_token;
      this.extensionKey = data.extension_api_key;
      
      if (this.authToken) {
        console.log('🔑 Auth token loaded');
      } else {
        console.log('🔒 No auth token found');
      }
    } catch (error) {
      console.error('Failed to load auth data:', error);
    }
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📨 Message received:', message.action || message.type);
      
      switch(message.action || message.type) {
        case 'ENHANCE_POST':
          console.log('🎨 Enhance request received');
          this.handleEnhanceRequest(message.credentials || message);
          sendResponse({ success: true });
          break;
          
        case 'postNow':
          this.handlePostRequest(message.post);
          sendResponse({ success: true });
          break;
          
        case 'fillPost':
          this.fillPostContent(message.content);
          sendResponse({ success: true });
          break;
          
        case 'PHANTOM_POST_STORE':
          console.log('📦 Phantom post store request:', message.postId);
          if (chrome?.storage?.local && message.postData) {
            chrome.storage.local.set({
              [`smartsocial_${message.postId}`]: message.postData
            });
            console.log('✅ Phantom post stored in extension');
          }
          sendResponse({ success: true });
          break;
          
        case 'getPostData':
          sendResponse({ success: true, post: this.currentPost });
          break;
          
        case 'getScheduledPosts':
          chrome.runtime.sendMessage(message, sendResponse);
          return true;
          
        case 'PHANTOM_FILL':
          console.log('🚀 Manual phantom fill triggered');
          if (message.postId) {
            this.fillPhantomPost(message.postId);
          }
          sendResponse({ success: true });
          break;
      }
      
      return true;
    });
  }

  setupMutationObserver() {
    let debounceTimer;
    let urlCheckTimer;
    
    const observer = new MutationObserver((mutations) => {
      // Debounced UI check
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!this.isProcessing && !this.isEnhancing) {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                  this.checkForComposer(node);
                }
              });
            }
          });
        }
      }, 300);
      
      // URL change detection (debounced)
      if (location.href !== this.lastUrl) {
        clearTimeout(urlCheckTimer);
        urlCheckTimer = setTimeout(() => {
          this.lastUrl = location.href;
          console.log('🔄 URL changed, checking for phantom fill...');
          if (!this.isPhantomProcessing) {
            this.checkForPhantomFill();
          }
        }, 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    this.lastUrl = location.href;
  }

  checkForComposer(node) {
    const composerSelectors = [
      '.share-box-feed-entry__trigger',
      '.artdeco-button--primary[data-test-share-box-btn]',
      '[data-test-share-box]',
      '.sharing-share-box__trigger',
      '.share-box',
      '.feed-shared-update-v2'
    ];
    
    for (const selector of composerSelectors) {
      if (node.matches?.(selector) || node.querySelector?.(selector)) {
        setTimeout(() => this.injectEnhancementButtons(), 100);
        break;
      }
    }
  }

  injectEnhancementButtons() {
    console.log('🔍 Looking for LinkedIn composers...');
    
    // Main composer buttons
    const composerSelectors = [
      '.share-box-feed-entry__trigger',
      '.artdeco-button--primary[data-test-share-box-btn]',
      '[data-test-share-box] .share-box__open',
      '.sharing-share-box__trigger',
      'button[aria-label*="Start a post"]'
    ];
    
    composerSelectors.forEach(selector => {
      const composers = document.querySelectorAll(selector);
      composers.forEach(composer => {
        if (!composer.parentElement.querySelector('.smartsocial-enhance-btn')) {
          this.createEnhanceButton(composer);
        }
      });
    });
    
    // Existing editors
    const editorSelectors = [
      '.ql-editor[contenteditable="true"]',
      '[role="textbox"][contenteditable="true"]',
      '[data-test-share-box-content]',
      '.share-box__textarea'
    ];
    
    editorSelectors.forEach(selector => {
      const editors = document.querySelectorAll(selector);
      editors.forEach(editor => {
        const parent = editor.closest('.artdeco-modal, .share-box-feed-entry__modal, [role="dialog"]');
        if (parent && !parent.querySelector('.smartsocial-enhance-btn')) {
          this.createEnhanceButton(parent);
        }
      });
    });
  }

  createEnhanceButton(container) {
    const button = document.createElement('button');
    button.className = 'smartsocial-enhance-btn';
    button.innerHTML = '✨ Enhance with AI';
    button.title = 'Enhance this post with SmartSocial AI';
    button.dataset.smartsocial = 'enhance-btn';
    
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await this.enhanceCurrentPost();
    });
    
    if (container.classList?.contains('artdeco-button')) {
      container.parentNode.insertBefore(button, container.nextSibling);
    } else if (container.classList?.contains('share-box')) {
      container.appendChild(button);
    } else {
      container.appendChild(button);
    }
    
    console.log('✅ Added enhance button');
  }

  async enhanceCurrentPost() {
    if (this.isEnhancing) {
      this.showNotification('Already enhancing...', 'info');
      return;
    }
    
    this.isEnhancing = true;
    
    try {
      this.showNotification('Enhancing with AI...', 'info');
      
      const postContent = this.getPostContent();
      
      if (!postContent.trim()) {
        this.showNotification('Please write something first', 'warning');
        this.isEnhancing = false;
        return;
      }
      
      if (!this.authToken) {
        await this.loadAuthData();
        
        if (!this.authToken) {
          this.showNotification('Please login to SmartSocial first', 'error');
          this.isEnhancing = false;
          return;
        }
      }
      
      console.log('📤 Sending to AI:', postContent.substring(0, 50) + '...');
      
      const enhanced = await this.callEnhancementAPI(postContent);
      
      if (enhanced.success && enhanced.caption) {
        const replaced = this.setPostContent(enhanced.caption);
        
        if (replaced) {
          this.showNotification('Post enhanced! 🎉', 'success');
          
          if (enhanced.suggestions && enhanced.suggestions.length > 0) {
            setTimeout(() => this.showSuggestions(enhanced.suggestions), 500);
          }
        } else {
          this.showNotification('Could not update post editor', 'error');
        }
      } else {
        this.showNotification(`Failed: ${enhanced.message || 'Unknown error'}`, 'error');
      }
      
    } catch (error) {
      console.error('Enhancement failed:', error);
      this.showNotification('Failed to enhance post: ' + error.message, 'error');
    } finally {
      this.isEnhancing = false;
    }
  }

  getPostContent() {
    const editorSelectors = [
      '.ql-editor[contenteditable="true"]',
      '[role="textbox"][contenteditable="true"]',
      '[data-test-share-box-content]',
      '.share-box__textarea',
      '.editor-content',
      'div[contenteditable="true"]'
    ];
    
    for (const selector of editorSelectors) {
      const editor = document.querySelector(selector);
      if (editor) {
        return editor.textContent || editor.innerText || '';
      }
    }
    
    return '';
  }

  setPostContent(content) {
    const editorSelectors = [
      '.ql-editor[contenteditable="true"]',
      '[role="textbox"][contenteditable="true"]',
      '[data-test-share-box-content]',
      'div[contenteditable="true"]'
    ];
    
    for (const selector of editorSelectors) {
      const editor = document.querySelector(selector);
      if (editor) {
        try {
          editor.focus();
          
          const range = document.createRange();
          range.selectNodeContents(editor);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          
          document.execCommand('insertText', false, content);
          
          console.log('✅ Post content updated');
          return true;
        } catch (error) {
          console.error('Failed to set content:', error);
          editor.textContent = content;
          return true;
        }
      }
    }
    
    console.error('❌ No editor found for setting content');
    return false;
  }

  async callEnhancementAPI(content) {
    try {
      const response = await fetch('https://datasenceai.com/api/extension/v1/linkedin/caption', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'X-Extension-Key': this.extensionKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          prompt: content,
          context: {
            platform: 'linkedin',
            action: 'enhance',
            source: 'extension'
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 API response:', data.success ? 'Success' : 'Failed');
      return data;
      
    } catch (error) {
      console.error('API call failed:', error);
      return {
        success: false,
        message: error.message || 'Network error'
      };
    }
  }

  showNotification(message, type = 'info') {
    document.querySelectorAll('.smartsocial-notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `smartsocial-notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      padding: 14px 24px !important;
      border-radius: 10px !important;
      z-index: 10000 !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      animation: slideIn 0.3s ease !important;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
      max-width: 320px !important;
      background: ${type === 'success' ? '#10b981' : 
                  type === 'error' ? '#ef4444' : 
                  type === 'warning' ? '#f59e0b' : '#3b82f6'} !important;
      color: white !important;
      font-family: -apple-system, system-ui, BlinkMacSystemFont !important;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    if (!document.querySelector('#smartsocial-animations')) {
      const style = document.createElement('style');
      style.id = 'smartsocial-animations';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  showSuggestions(suggestions) {
    document.querySelectorAll('.smartsocial-suggestions').forEach(s => s.remove());
    
    const container = document.createElement('div');
    container.className = 'smartsocial-suggestions';
    container.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      background: white !important;
      border-radius: 12px !important;
      padding: 20px !important;
      width: 320px !important;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
      z-index: 10000 !important;
      border: 1px solid #e5e7eb !important;
      font-family: -apple-system, system-ui, BlinkMacSystemFont !important;
    `;
    
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 16px; color: #1f2937; display: flex; align-items: center; gap: 8px;">
          💡 AI Suggestions
        </h3>
        <button id="close-suggestions" style="
          background: none !important;
          border: none !important;
          cursor: pointer !important;
          font-size: 20px !important;
          color: #6b7280 !important;
          padding: 4px !important;
          line-height: 1 !important;
        ">×</button>
      </div>
      <ul style="margin: 0; padding-left: 20px;">
        ${suggestions.map(s => `<li style="margin-bottom: 8px; font-size: 14px; color: #4b5563;">${s}</li>`).join('')}
      </ul>
    `;
    
    document.body.appendChild(container);
    
    container.querySelector('#close-suggestions').addEventListener('click', () => {
      container.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => container.remove(), 300);
    });
    
    setTimeout(() => {
      if (container.parentNode) {
        container.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => container.remove(), 300);
      }
    }, 10000);
  }

  // ====================
  // POST SCHEDULING FUNCTIONS
  // ====================
  
  handleEnhanceRequest(credentials) {
    console.log('🎨 Manual enhance request');
    this.authToken = credentials.token || this.authToken;
    this.extensionKey = credentials.extensionKey || this.extensionKey;
    this.enhanceCurrentPost();
  }

  handlePostRequest(post) {
    console.log('📝 Handling scheduled post:', post.id);
    this.currentPost = post;
    this.isProcessing = true;
    
    this.triggerPostButton();
    
    setTimeout(() => {
      if (this.isProcessing) {
        console.log('⚠️ Posting timed out');
        this.isProcessing = false;
        this.currentPost = null;
        
        chrome.runtime.sendMessage({
          action: 'postFailed',
          postId: post.id,
          error: 'Timeout'
        });
      }
    }, 30000);
  }

  triggerPostButton() {
    console.log('🔍 Looking for post button...');
    
    const postButtonSelectors = [
      '.share-box__open',
      '.artdeco-button--primary',
      'button[data-test-id="share-post"]',
      'button[aria-label*="Start a post"]',
      'button:contains("Start a post")'
    ];
    
    for (const selector of postButtonSelectors) {
      const button = document.querySelector(selector);
      if (button && button.offsetParent !== null) {
        console.log(`✅ Found button: ${selector}`);
        button.click();
        return;
      }
    }
    
    console.log('❌ No post button found');
  }

  fillPostContent(post) {
    console.log('🖊️ Filling post content...');
    
    const textAreaSelectors = [
      '.ql-editor',
      '[role="textbox"]',
      '[contenteditable="true"]',
      '.editor-content'
    ];
    
    let editor = null;
    
    for (const selector of textAreaSelectors) {
      const element = document.querySelector(selector);
      if (element && element.isContentEditable) {
        editor = element;
        break;
      }
    }
    
    if (editor) {
      console.log('✅ Found editor, filling content...');
      
      editor.innerHTML = '';
      
      this.typeLikeHuman(editor, post.caption);
      
      setTimeout(() => {
        this.isProcessing = false;
        this.currentPost = null;
        
        chrome.runtime.sendMessage({
          action: 'postCompleted',
          postId: post.id,
          platform: 'linkedin'
        });
        
        console.log('✅ Post content filled successfully');
        this.showNotification('Post content filled! Please review and click "Post" button.', 'success');
        
      }, post.caption.length * 80);
      
    } else {
      console.log('❌ No editor found, retrying...');
      setTimeout(() => this.fillPostContent(post), 500);
    }
  }

  typeLikeHuman(element, text) {
    let i = 0;
    const type = () => {
      if (i < text.length) {
        const char = text.charAt(i);
        element.innerHTML += char;
        
        if (Math.random() < 0.02 && i > 5) {
          setTimeout(() => {
            element.innerHTML = element.innerHTML.slice(0, -1);
            setTimeout(() => {
              element.innerHTML += char;
            }, Math.random() * 100 + 50);
          }, Math.random() * 100 + 50);
        }
        
        i++;
        setTimeout(type, Math.random() * 80 + 30);
      }
    };
    type();
  }
}

// ====================
// INITIALIZATION
// ====================
if (!window.linkedinAssistant) {
  const initAssistant = () => {
    window.linkedinAssistant = new LinkedInAssistant();
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAssistant);
  } else {
    initAssistant();
  }
}

console.log('🚀 LinkedIn Assistant ready for action!');