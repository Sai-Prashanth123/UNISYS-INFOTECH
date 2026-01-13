import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { useThemeStore } from '../store/index.js';

export const Layout = () => {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <div className={isDark ? 'dark' : ''}>
      <Navbar />
      <main className={isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
