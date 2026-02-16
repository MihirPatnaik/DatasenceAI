// src/smartsocial/hooks/usePreload.ts

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Cache for preloaded components
const preloadedComponents = new Set<string>();

// More aggressive preloading that includes QuotaBar initialization
export const usePreload = (): void => {
  const location = useLocation();

  useEffect(() => {
    const preloadDashboardComponents = async (): Promise<void> => {
      if (preloadedComponents.has('dashboard')) {
        console.log('🚀 Dashboard already preloaded - skipping');
        return;
      }

      try {
        console.log('🔄 Aggressively preloading ALL dashboard components...');

        // Preload ALL dashboard dependencies including their Firebase connections
        const preloadPromises = await Promise.allSettled([
          // Core pages
          import('../pages/SmartSocialDashboard'),
          import('../pages/smartsocialHome'),
          
          // All dashboard components
          import('../components/QuotaBar'),
          import('../components/AnimatedCounter'),
          import('../components/Header'),
          import('../components/SocialPlatformIcon'),
          
          // Firebase utilities that QuotaBar uses
          import('../utils/userContext'),
          import('../utils/firebase')
        ]);

        // Log preload results
        preloadPromises.forEach((result, index) => {
          const componentNames = [
            'SmartSocialDashboard',
            'smartsocialHome',
            'QuotaBar',
            'AnimatedCounter',
            'Header',
            'SocialPlatformIcon',
            'userContext',
            'firebase'
          ];

          if (result.status === 'fulfilled') {
            console.log(`✅ Preloaded: ${componentNames[index]}`);
          } else {
            console.warn(`❌ Failed to preload ${componentNames[index]}:`, result.reason);
          }
        });

        preloadedComponents.add('dashboard');
        console.log('🎉 ALL dashboard components preloaded and cached');

      } catch (error) {
        console.warn('❌ Failed to preload dashboard components:', error);
      }
    };

    // More aggressive preloading - trigger on ANY page that's not dashboard
    const shouldPreloadDashboard = !location.pathname.includes('/dashboard');

    if (shouldPreloadDashboard) {
      console.log('🚀 Triggering aggressive dashboard preload from:', location.pathname);
      preloadDashboardComponents();
    }

    // Also preload on any user interaction
    const handleUserInteraction = () => {
      if (!preloadedComponents.has('dashboard')) {
        console.log('👆 User interaction detected - preloading dashboard');
        preloadDashboardComponents();
      }
    };

    // Add more event listeners for better coverage
    const events = ['click', 'touchstart', 'mousemove', 'keydown', 'scroll'];

    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [location]);
};

// Immediate preload for critical components
export const useCriticalPreload = (): void => {
  useEffect(() => {
    const preloadCritical = async () => {
      try {
        await Promise.allSettled([
          import('../components/Header'),
          import('../components/QuotaBar'),
          import('../utils/firebase'),
          import('../utils/userContext')
        ]);
        console.log('✅ Critical components preloaded on app start');
      } catch (error) {
        console.warn('Critical preload failed:', error);
      }
    };

    // Preload immediately but don't block the app
    setTimeout(preloadCritical, 100);
  }, []);
};
