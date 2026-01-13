import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useThemeStore } from '../../store/index.js';

/**
 * ServiceCard Component
 * 
 * Enterprise-grade service card with icon, title, description, and features
 * 
 * @param {React.Component} icon - Lucide React icon component
 * @param {string} title - Service title
 * @param {string} description - Service description
 * @param {string[]} features - Array of key features
 * @param {string} link - Navigation link
 */
const ServiceCard = ({ icon: Icon, title, description, features, link }) => {
  const { isDark } = useThemeStore();

  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl p-8 h-full flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
        isDark 
          ? 'glass-effect-dark backdrop-blur-2xl hover:bg-slate-700/50' 
          : 'glass-effect backdrop-blur-2xl hover:bg-white/80'
      }`}
    >
      {/* Icon Container */}
      <div className="mb-6">
        <div className={`inline-flex p-4 rounded-xl transition-all duration-300 group-hover:scale-110 ${
          isDark ? 'bg-indigo-500/20' : 'bg-indigo-50'
        }`}>
          <Icon className={`w-10 h-10 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} strokeWidth={1.5} />
        </div>
      </div>

      {/* Title */}
      <h3 className={`text-2xl font-bold mb-4 transition-colors ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`text-lg mb-6 flex-grow leading-relaxed ${
        isDark ? 'text-slate-300' : 'text-slate-600'
      }`}>
        {description}
      </p>

      {/* Features List */}
      <ul className="space-y-3 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
              isDark 
                ? 'bg-indigo-500/20 text-indigo-400' 
                : 'bg-indigo-100 text-indigo-600'
            }`}>
              ✓
            </span>
            <span className={`text-base ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* Learn More Link */}
      <Link 
        to={link}
        className={`group/link mt-auto inline-flex items-center gap-2 font-semibold transition-all duration-300 ${
          isDark 
            ? 'text-indigo-400 hover:text-indigo-300' 
            : 'text-indigo-600 hover:text-indigo-700'
        }`}
      >
        <span>Learn More</span>
        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/link:translate-x-1" />
      </Link>

      {/* Decorative gradient overlay on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
        isDark 
          ? 'bg-gradient-to-br from-indigo-500/5 to-transparent' 
          : 'bg-gradient-to-br from-indigo-50/50 to-transparent'
      }`} />
    </div>
  );
};

export { ServiceCard };
export default ServiceCard;
