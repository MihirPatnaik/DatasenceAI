//src/smartsocial/components/ScrollToTop.tsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    console.log('🎯 ScrollToTop Debug:');
    console.log(' - Current path:', pathname);
    console.log(' - Window scrollY:', window.scrollY);
    console.log(' - Document scrollTop:', document.documentElement.scrollTop);
    
    // Multiple methods to ensure scroll reset
    window.scrollTo(0, 0);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    
    document.documentElement.scrollTo(0, 0);
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    
    document.body.scrollTo(0, 0);
    
    console.log(' - After reset - Window scrollY:', window.scrollY);
    
  }, [pathname]);

  return null;
};

export default ScrollToTop;