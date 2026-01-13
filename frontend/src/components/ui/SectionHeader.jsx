import { useThemeStore } from '../../store/index.js';

/**
 * SectionHeader Component
 * 
 * Reusable section header with title and optional subtitle
 * 
 * @param {string} title - Main heading text
 * @param {string} subtitle - Optional supporting text
 * @param {string} align - Text alignment: 'left' | 'center' | 'right'
 */
const SectionHeader = ({ title, subtitle, align = 'center' }) => {
  const { isDark } = useThemeStore();

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <div className={`mb-12 animate-slide-up ${alignmentClass[align]}`}>
      <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg md:text-xl max-w-3xl ${align === 'center' ? 'mx-auto' : ''} ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export { SectionHeader };
export default SectionHeader;
