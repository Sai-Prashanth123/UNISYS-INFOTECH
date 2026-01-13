import React from 'react';

/**
 * Reusable Card Component
 * For service cards, testimonials, etc.
 */
export const Card = ({ children, className = '', hover = false, isDark = false }) => {
  const baseStyles = 'rounded-2xl p-8 transition-all duration-300';
  const backgroundStyles = isDark 
    ? 'bg-slate-800 border border-slate-700' 
    : 'bg-white border border-slate-200 shadow-md';
  const hoverStyles = hover 
    ? 'hover:shadow-xl hover:scale-[1.02] hover:border-indigo-500/50' 
    : '';
  
  return (
    <div className={`${baseStyles} ${backgroundStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Service Card Component - Specialized card for services
 */
export const ServiceCard = ({ 
  icon: Icon, 
  title, 
  description, 
  outcome, 
  idealFor, 
  miniCase, 
  link, 
  isDark = false 
}) => {
  return (
    <Card hover isDark={isDark} className="group h-full flex flex-col">
      {/* Icon */}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${
        isDark ? 'bg-slate-900/50' : 'bg-indigo-50'
      }`}>
        <Icon size={28} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
      </div>
      
      {/* Title */}
      <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h3>
      
      {/* Description */}
      <p className={`text-base mb-5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        {description}
      </p>
      
      {/* Expected Outcome */}
      <div className="mb-4">
        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${
          isDark ? 'text-slate-500' : 'text-slate-500'
        }`}>
          Expected Outcome
        </p>
        <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {outcome}
        </p>
      </div>
      
      {/* Ideal For */}
      <div className="mb-5">
        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${
          isDark ? 'text-slate-500' : 'text-slate-500'
        }`}>
          Ideal For
        </p>
        <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {idealFor}
        </p>
      </div>
      
      {/* Mini Case Result */}
      {miniCase && (
        <div className={`mb-5 p-4 rounded-lg ${
          isDark ? 'bg-slate-900/50 border border-slate-700' : 'bg-slate-50 border border-slate-200'
        }`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
            isDark ? 'text-indigo-400' : 'text-indigo-600'
          }`}>
            Result
          </p>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {miniCase}
          </p>
        </div>
      )}
      
      {/* Learn More Link - Pushed to bottom */}
      <a
        href={link}
        className={`inline-flex items-center gap-2 text-sm font-semibold mt-auto transition-colors ${
          isDark 
            ? 'text-indigo-400 hover:text-indigo-300' 
            : 'text-indigo-600 hover:text-indigo-700'
        }`}
      >
        Learn More 
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </Card>
  );
};

/**
 * Testimonial Card Component
 */
export const TestimonialCard = ({ quote, author, role, company, result, rating = 5, isDark = false }) => {
  return (
    <Card isDark={isDark} className="h-full flex flex-col">
      {/* Rating Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      
      {/* Quote */}
      <blockquote 
        className={`text-lg leading-relaxed mb-6 flex-grow ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}
        dangerouslySetInnerHTML={{ __html: `"${quote}"` }}
      />
      
      {/* Result Badge */}
      {result && (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 w-fit ${
          isDark ? 'bg-green-900/30 border border-green-800' : 'bg-green-50 border border-green-200'
        }`}>
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className={`text-sm font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
            {result}
          </span>
        </div>
      )}
      
      {/* Author Info */}
      <div className={`border-t pt-5 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {author}
        </p>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {role} · {company}
        </p>
      </div>
    </Card>
  );
};
