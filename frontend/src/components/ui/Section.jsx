import React from 'react';

/**
 * Reusable Section Component
 * Provides consistent spacing and styling for page sections
 */
export const Section = ({ 
  children, 
  className = '', 
  background = 'default',
  padding = 'default',
  isDark = false 
}) => {
  const backgrounds = {
    default: isDark ? 'bg-slate-900' : 'bg-white',
    alt: isDark ? 'bg-slate-800/50' : 'bg-slate-50',
    white: isDark ? 'bg-slate-900' : 'bg-white',
    gradient: isDark 
      ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900' 
      : 'bg-gradient-to-b from-blue-50 via-white to-blue-50'
  };
  
  const paddings = {
    none: 'py-0',
    sm: 'py-12',
    default: 'py-20',
    lg: 'py-28'
  };
  
  return (
    <section className={`px-4 ${backgrounds[background]} ${paddings[padding]} ${className}`}>
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </section>
  );
};

/**
 * Section Heading Component
 * Standardized heading styles for consistency
 */
export const SectionHeading = ({ 
  overline, 
  title, 
  subtitle, 
  centered = false, 
  className = '',
  isDark = false 
}) => {
  const alignClass = centered ? 'text-center' : '';
  const marginClass = centered ? 'mx-auto' : '';
  
  return (
    <div className={`mb-16 ${alignClass} ${className}`}>
      {overline && (
        <p className={`text-sm font-bold uppercase tracking-wider mb-3 ${
          isDark ? 'text-indigo-400' : 'text-indigo-600'
        }`}>
          {overline}
        </p>
      )}
      <h2 className={`text-4xl md:text-5xl font-bold mb-6 leading-tight ${
        isDark ? 'text-white' : 'text-slate-900'
      } ${marginClass} ${centered ? 'max-w-3xl' : ''}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-xl leading-relaxed ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        } ${marginClass} ${centered ? 'max-w-2xl' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
