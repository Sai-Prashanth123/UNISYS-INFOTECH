import React from 'react';

/**
 * Reusable Badge Component
 * For security certifications, tags, etc.
 */
export const Badge = ({ children, variant = 'default', className = '', isDark = false }) => {
  const variants = {
    default: isDark 
      ? 'bg-slate-800 text-slate-300 border-slate-700' 
      : 'bg-slate-100 text-slate-700 border-slate-300',
    primary: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    success: isDark
      ? 'bg-green-900/30 text-green-400 border-green-800'
      : 'bg-green-50 text-green-700 border-green-200',
    security: isDark
      ? 'bg-blue-900/30 text-blue-400 border-blue-800'
      : 'bg-blue-50 text-blue-700 border-blue-200'
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

/**
 * Security Badge Component - For compliance badges
 */
export const SecurityBadge = ({ name, isDark = false }) => {
  return (
    <div className={`group inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
      isDark 
        ? 'bg-slate-800/50 border-slate-700 hover:border-blue-800 hover:bg-slate-800' 
        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50 shadow-sm hover:shadow-md'
    }`}>
      <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <span className={`text-sm font-semibold ${isDark ? 'text-slate-300 group-hover:text-blue-400' : 'text-slate-700 group-hover:text-blue-700'}`}>
        {name}
      </span>
    </div>
  );
};
