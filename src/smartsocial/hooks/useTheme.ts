//src/smartsocial/hooks/useTheme.ts

import { useEffect, useState } from 'react';

export const useTheme = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem('smartSocial-theme');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('smartSocial-theme', JSON.stringify(isDarkTheme));
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return { isDarkTheme, toggleTheme };
};