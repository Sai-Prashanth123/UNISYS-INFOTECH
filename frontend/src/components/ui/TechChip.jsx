import { useThemeStore } from '../../store/index.js';

/**
 * TechChip Component
 * 
 * Pill-shaped chip for displaying technology/skill tags
 * 
 * @param {React.Component} icon - Optional Lucide React icon component
 * @param {string} logo - Optional logo URL
 * @param {string} label - Chip text label
 * @param {string} variant - Color variant: 'primary' | 'secondary' | 'accent'
 */
const TechChip = ({ icon: Icon, logo, label, variant = 'primary' }) => {
  const { isDark } = useThemeStore();

  const variantStyles = {
    primary: isDark 
      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30 hover:bg-indigo-500/30' 
      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    secondary: isDark 
      ? 'bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50' 
      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
    accent: isDark 
      ? 'bg-purple-500/20 text-purple-300 border-purple-400/30 hover:bg-purple-500/30' 
      : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
  };

  return (
    <div 
      className={`inline-flex items-center gap-3 px-6 py-3 rounded-[14px] border transition-all duration-300 cursor-default hover:scale-105 min-w-fit ${variantStyles[variant]}`}
    >
      {logo ? (
        <img src={logo} alt={label} className="w-10 h-10 object-contain flex-shrink-0" />
      ) : Icon ? (
        <Icon className="w-6 h-6 flex-shrink-0" strokeWidth={2} />
      ) : null}
      <span className="text-base font-medium whitespace-nowrap">{label}</span>
    </div>
  );
};

export { TechChip };
export default TechChip;
