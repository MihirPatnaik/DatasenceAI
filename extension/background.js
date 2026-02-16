// SmartSocial Extension - Background Service Worker (Phantom Fill Focus)

console.log('🎯 SmartSocial background service loaded');

class PhantomFillBackground {
  constructor() {
    this.initialize();
  }

  async initialize() {
    console.log('🔄 Initializing Phantom Fill background...');
    
    // Setup message listeners
    this.setupMessageListeners();
    
    console.log('✅ Phantom Fill background ready');
  }

  setupMessageListeners() {
    // Messages from external web app
    chrome.runtime.onMessageExternal.addListener(
      (request, sender, sendResponse) => {
        console.log('📨 External message from:', sender.url);
        
        // Validate sender
        if (!this.isValidSender(sender.url)) {
          sendResponse({ success: false, error: 'Unauthorized domain' });
          return true;
        }
        
        switch(request.action) {
          case 'checkPhantomFill':
            sendResponse({ success: true, status: 'ready' });
            break;
            
          case 'PHANTOM_POST_STORE':
            // Store phantom post for content script
            if (request.postId && request.postData) {
              chrome.storage.local.set({
                [`smartsocial_${request.postId}`]: request.postData
              });
              console.log('📦 Phantom post stored:', request.postId);
            }
            sendResponse({ success: true });
            break;
            
          default:
            sendResponse({ success: false, error: 'Unknown action' });
        }
        
        return true;
      }
    );

    // Messages from content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📱 From content script:', message.action);
      
      switch(message.action) {
        case 'PHANTOM_FILL':
          // Forward to other tabs if needed
          this.broadcastToLinkedInTabs(message);
          sendResponse({ success: true });
          break;
          
        case 'getAuthData':
          chrome.storage.local.get(['extension_auth_token', 'extension_api_key'], (data) => {
            sendResponse(data);
          });
          return true;
          
        case 'postCompleted':
        case 'postFailed':
          // Log post events
          console.log(`Post ${message.action}:`, message.postId);
          break;
      }
      
      return true;
    });
  }

  broadcastToLinkedInTabs(message) {
    chrome.tabs.query({ url: "*://*.linkedin.com/*" }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Tab might not have content script ready
        });
      });
    });
  }

  isValidSender(url) {
    if (!url) return false;
    
    const allowedDomains = [
      'datasenceai.com',
      'localhost:5173',
      'localhost:3000'
    ];
    
    return allowedDomains.some(domain => url.includes(domain));
  }
}

// Initialize
const background = new PhantomFillBackground();

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log(`🔧 Extension ${details.reason}: v${chrome.runtime.getManifest().version}`);
  
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'https://datasenceai.com/welcome?source=extension' });
  }
});

console.log('🚀 SmartSocial Phantom Fill background running');