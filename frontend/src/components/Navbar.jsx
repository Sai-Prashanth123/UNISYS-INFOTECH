import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/index.js';
import { useThemeStore } from '../store/index.js';
import { Menu, X, Sun, Moon, LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
  };

  const loginOptions = [
    { role: 'admin', label: 'Admin/Manager Login', path: '/login/admin' },
    { role: 'employer', label: 'Manager Login', path: '/login/employer' },
    { role: 'employee', label: 'Employee Login', path: '/login/employee' }
  ];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLoginDropdown(false);
      }
    };

    if (showLoginDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLoginDropdown]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      {/* White Glass morphism background */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-lg transition-all duration-300"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group relative z-10">
            <img 
              src="/logo.png" 
              alt="UNISYS INFOTECH" 
              className="h-24 w-auto group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Menu - Centered */}
          <div className="hidden md:flex items-center space-x-1 relative z-10">
            <Link to="/" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 animate-fade-in" style={{animationDelay: '0.1s'}}>
              Home
            </Link>
            <Link to="/about" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 animate-fade-in" style={{animationDelay: '0.2s'}}>
              About
            </Link>
            <Link to="/services" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 animate-fade-in" style={{animationDelay: '0.3s'}}>
              Services
            </Link>
            <Link to="/careers" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 animate-fade-in" style={{animationDelay: '0.4s'}}>
              Careers
            </Link>
            <Link to="/contact" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 animate-fade-in" style={{animationDelay: '0.5s'}}>
              Contact
            </Link>
          </div>

          {/* Right side - CTA Button */}
          <div className="flex items-center space-x-3 relative z-10">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-700 hidden sm:inline font-medium">{user.name}</span>
                <Link 
                  to={
                    user.role === 'admin' ? '/admin/dashboard' : 
                    user.role === 'employer' ? '/employer/dashboard' : 
                    user.role === 'employee' ? '/employee/timecards' : 
                    '/user/dashboard'
                  } 
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30"
                >
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                  className="px-6 py-2.5 bg-slate-900/90 backdrop-blur-lg hover:bg-slate-900 text-white text-sm font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10"
                >
                  Login
                </button>
                
                {/* Apple-style Dropdown Menu */}
                {showLoginDropdown && (
                  <div className="absolute right-0 mt-3 w-64 animate-fade-in">
                    <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden">
                      {/* Header */}
                      <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Login Type</p>
                      </div>
                      
                      {/* Options */}
                      <div className="py-2">
                        {loginOptions.map((option, idx) => (
                          <Link
                            key={option.role}
                            to={option.path}
                            onClick={() => setShowLoginDropdown(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-all duration-150 group"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                              <User size={18} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-slate-800 text-sm">{option.label}</p>
                              <p className="text-xs text-slate-500 capitalize">{option.role} Portal</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-4 space-y-1 border-t border-slate-200 bg-white">
            <Link to="/" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200">
              Home
            </Link>
            <Link to="/about" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200">
              About
            </Link>
            <Link to="/services" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200">
              Services
            </Link>
            <Link to="/careers" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200">
              Careers
            </Link>
            <Link to="/contact" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200">
              Contact
            </Link>
            {user && (
              <Link 
                to={
                  user.role === 'admin' ? '/admin/dashboard' : 
                  user.role === 'employer' ? '/employer/dashboard' : 
                  user.role === 'employee' ? '/employee/timecards' : 
                  '/user/dashboard'
                } 
                className="block px-4 py-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
              >
                Dashboard
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
