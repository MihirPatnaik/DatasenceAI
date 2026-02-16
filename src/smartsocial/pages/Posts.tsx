//src/smartsocial/pages/Posts.tsx

import { useEffect } from 'react';

// Inside your Posts component:
useEffect(() => {
  // Pre-warm the cache for dashboard when user is on posts page
  const preloadDashboard = async () => {
    try {
      await import('./SmartSocialDashboard');
      console.log('✅ Dashboard preloaded from posts page');
    } catch (error) {
      console.warn('Could not preload dashboard:', error);
    }
  };

  preloadDashboard();
}, []);