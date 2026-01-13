import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/index.js';
import { Code, Cloud, Database, Briefcase, TestTube, TrendingUp, Globe, GitBranch, BarChart3 } from 'lucide-react';

export const AnimatedServicesNetwork = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const navigate = useNavigate();
  const [activeNodes, setActiveNodes] = useState([]);

  const services = [
    { id: 1, icon: Code, label: 'Software Development', angle: 0, distance: 180, link: '/services/software-development' },
    { id: 2, icon: Cloud, label: 'Cloud Services', angle: 60, distance: 180, link: '/services/cloud-services' },
    { id: 3, icon: Database, label: 'DBA Services', angle: 120, distance: 180, link: '/services/dba' },
    { id: 4, icon: Briefcase, label: 'Professional Services', angle: 180, distance: 180, link: '/services/professional' },
    { id: 5, icon: TestTube, label: 'QA & Testing', angle: 240, distance: 180, link: '/services/qa' },
    { id: 6, icon: BarChart3, label: 'Business Intelligence', angle: 300, distance: 180, link: '/services/business-intelligence' }
  ];

  useEffect(() => {
    // Animate nodes appearing one by one - activate all 6 services
    const serviceIds = [1, 2, 3, 4, 5, 6];
    serviceIds.forEach((id, index) => {
      setTimeout(() => {
        setActiveNodes(prev => [...prev, id]);
      }, index * 200);
    });
  }, []);

  const getNodePosition = (angle, distance) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * distance,
      y: Math.sin(radian) * distance
    };
  };

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center bg-transparent">
      {/* SVG for connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? '#4f46e5' : '#6366f1'} stopOpacity="0.1" />
            <stop offset="50%" stopColor={isDark ? '#4f46e5' : '#6366f1'} stopOpacity="0.6" />
            <stop offset="100%" stopColor={isDark ? '#4f46e5' : '#6366f1'} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {services.map((service) => {
          const pos = getNodePosition(service.angle, service.distance);
          const isActive = activeNodes.includes(service.id);
          
          return (
            <g key={service.id}>
              {/* Connection line */}
              <line
                x1="50%"
                y1="50%"
                x2={`calc(50% + ${pos.x}px)`}
                y2={`calc(50% + ${pos.y}px)`}
                stroke="url(#lineGradient)"
                strokeWidth="2"
                className="transition-all duration-500"
                style={{
                  opacity: isActive ? 1 : 0,
                  strokeDasharray: isActive ? '0' : '300',
                  strokeDashoffset: isActive ? '0' : '300'
                }}
              />
              
              {/* Animated dots along the line */}
              {isActive && (
                <>
                  {/* First particle */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="3"
                    fill={isDark ? '#818cf8' : '#6366f1'}
                    opacity="0.8"
                  >
                    <animate
                      attributeName="cx"
                      from="50%"
                      to={`calc(50% + ${pos.x}px)`}
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      from="50%"
                      to={`calc(50% + ${pos.y}px)`}
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  
                  {/* Second particle with delay */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="3"
                    fill={isDark ? '#a78bfa' : '#8b5cf6'}
                    opacity="0.6"
                  >
                    <animate
                      attributeName="cx"
                      from="50%"
                      to={`calc(50% + ${pos.x}px)`}
                      dur="3s"
                      begin="1s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      from="50%"
                      to={`calc(50% + ${pos.y}px)`}
                      dur="3s"
                      begin="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  
                  {/* Third particle with delay */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="2"
                    fill={isDark ? '#c4b5fd' : '#a78bfa'}
                    opacity="0.5"
                  >
                    <animate
                      attributeName="cx"
                      from="50%"
                      to={`calc(50% + ${pos.x}px)`}
                      dur="3s"
                      begin="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      from="50%"
                      to={`calc(50% + ${pos.y}px)`}
                      dur="3s"
                      begin="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Center node - Main globe/hub with organic blob background */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10" style={{ zIndex: 10 }}>
        {/* Organic blob background */}
        <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 animate-pulse" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: isDark ? '#4f46e5' : '#6366f1', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: isDark ? '#7c3aed' : '#8b5cf6', stopOpacity: 0.4 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#blobGradient)" 
            d="M47.4,-57.9C60.5,-49.1,69.4,-33.3,72.8,-16.2C76.2,0.9,74.2,19.3,65.8,34.1C57.4,48.9,42.6,60.1,26.3,65.8C10,71.5,-7.8,71.7,-24.3,66.4C-40.8,61.1,-55.9,50.3,-64.4,36C-72.9,21.7,-74.8,3.9,-71.2,-12.6C-67.6,-29.1,-58.5,-44.3,-45.9,-53.3C-33.3,-62.3,-16.7,-65.1,0.3,-65.5C17.2,-65.9,34.4,-66.7,47.4,-57.9Z" 
            transform="translate(100 100)"
            className="animate-morph"
          />
        </svg>

        {/* Main globe circle */}
        <div 
          className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl animate-float ${
            isDark ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 border-4 border-indigo-400/30' : 'bg-gradient-to-br from-indigo-500 to-indigo-700 border-4 border-white/50'
          }`}
        >
          <Globe className="w-14 h-14 text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Service nodes */}
      {services.map((service) => {
        const pos = getNodePosition(service.angle, service.distance);
        const Icon = service.icon;
        const isActive = activeNodes.includes(service.id);
        
        return (
          <div
            key={service.id}
            className={`absolute left-1/2 top-1/2 transition-all duration-700 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
            style={{
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
              zIndex: 5
            }}
          >
            <div className="relative group">
              {/* Service box as button */}
              <button 
                onClick={() => navigate(service.link)}
                className={`w-32 h-32 rounded-2xl flex flex-col items-center justify-center gap-2 p-4 shadow-xl cursor-pointer transform transition-all duration-300 hover:scale-110 hover:rotate-3 ${
                  isDark 
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-indigo-500' 
                    : 'bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-2xl'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-indigo-600/20' : 'bg-indigo-50'
                }`}>
                  <Icon className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <span className={`text-xs font-semibold text-center leading-tight ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {service.label}
                </span>
              </button>

              {/* Hover tooltip */}
              <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                isDark ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white text-slate-900 border border-slate-200 shadow-lg'
              }`}>
                Click to learn more →
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Add this to your global CSS or index.css
const styles = `
@keyframes float {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0px);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
`;
