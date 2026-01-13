import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/index.js';
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram, Shield, FileCheck, Lock } from 'lucide-react';

export const Footer = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${isDark ? 'bg-slate-900 text-white border-slate-800' : 'bg-slate-900 text-white'} border-t animate-fade-in`}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Company Info */}
          <div className="animate-slide-up">
            <div className="mb-4">
              <img 
                src="/logo.png" 
                alt="UNISYS INFOTECH" 
                className="h-28 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4">
              Leading IT solutions provider transforming businesses through innovative technology and expert consulting.
            </p>
          </div>

          {/* Quick Links */}
          <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h3 className="text-lg font-bold mb-6">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/services" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Software Development
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Cloud Services
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  DevOps & CI/CD
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Data Science
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  QA Automation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
            <h3 className="text-lg font-bold mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-secondary flex-shrink-0 mt-1" />
                <span className="text-gray-400">
                  Cornelius, NC 28031<br />United States
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-secondary flex-shrink-0" />
                <a href="mailto:info@unisysinfotech.com" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  info@unisysinfotech.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-800' : 'bg-slate-800'} border-t`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center">
            <div className="text-gray-400 text-center md:text-left animate-slide-up">
              <p>&copy; 2022 UNISYS INFOTECH. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
