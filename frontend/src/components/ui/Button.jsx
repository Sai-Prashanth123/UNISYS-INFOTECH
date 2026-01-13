import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Button Component
 * Variants: primary, secondary, ghost
 * Sizes: sm, md, lg
 */
export const Button = ({ 
  children, 
  to, 
  href, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  icon,
  iconPosition = 'right',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]',
    secondary: 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 hover:border-slate-400 shadow-md hover:shadow-lg',
    secondaryDark: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
    ghost: 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700',
    ghostDark: 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;
  
  const content = (
    <>
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </>
  );
  
  if (to) {
    return (
      <Link to={to} className={combinedClassName} {...props}>
        {content}
      </Link>
    );
  }
  
  if (href) {
    return (
      <a href={href} className={combinedClassName} {...props}>
        {content}
      </a>
    );
  }
  
  return (
    <button onClick={onClick} className={combinedClassName} {...props}>
      {content}
    </button>
  );
};
