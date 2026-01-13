import React from 'react';
import { useThemeStore } from '../store/index.js';

export const ThemeProvider = ({ children }) => {
  const isDark = useThemeStore((state) => state.isDark);

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return children;
};
