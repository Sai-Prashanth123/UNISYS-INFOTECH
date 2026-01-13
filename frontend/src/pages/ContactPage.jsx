import React from 'react';
import { useThemeStore } from '../store/index.js';
import { MapPin, Phone, Mail, Clock, CheckCircle2, Calendar, Zap } from 'lucide-react';
import axios from 'axios';

export const ContactPage = () => {
  const isDark = useThemeStore((state) => state.isDark);
  
  // Generate random captcha numbers
  const [captcha, setCaptcha] = React.useState({ num1: 0, num2: 0 });
  
  React.useEffect(() => {
    generateCaptcha();
  }, []);
  
  const generateCaptcha = () => {
    setCaptcha({
      num1: Math.floor(Math.random() * 10) + 1,
      num2: Math.floor(Math.random() * 10) + 1
    });
  };
  
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    captchaAnswer: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate captcha
    const correctAnswer = captcha.num1 + captcha.num2;
    if (parseInt(formData.captchaAnswer) !== correctAnswer) {
      setSubmitStatus({
        type: 'error',
        message: 'Incorrect answer to the math question. Please try again.'
      });
      generateCaptcha();
      setFormData({ ...formData, captchaAnswer: '' });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/contacts`, formData);
      
      setSubmitStatus({
        type: 'success',
        message: response.data.message || 'Thank you for your message! We will contact you within 24 hours.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        captchaAnswer: ''
      });
      generateCaptcha();
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Error submitting form. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={isDark ? 'bg-slate-900 text-white' : 'bg-slate-50'}>
      {/* Hero Section with Background Image */}
      <section 
        className="relative py-24 px-4 min-h-[500px] flex items-center animate-fade-in"
        style={{
          backgroundImage: 'url("/unisysinfotechcontact.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay for text readability */}
        <div className={`absolute inset-0 ${isDark ? 'bg-slate-900/85' : 'bg-slate-900/80'}`} />
        
        {/* Content */}
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-slide-up text-white">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl animate-slide-up text-slate-200" style={{animationDelay: '0.1s'}}>
            30-Minute Discovery Session with Our Solution Architects
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`py-20 px-4 ${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-800' : 'bg-white'} animate-fade-in`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Info */}
            <div className="animate-slide-in-left">
              <div className="space-y-4">
                <a 
                  href="https://maps.google.com/?q=20830+Torrence+Chapel+Rd+Ste+203+Cornelius+NC+28031"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200'} border rounded-xl p-6 flex items-start space-x-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer animate-slide-up group`}
                >
                  <MapPin className={`w-6 h-6 flex-shrink-0 mt-1 ${isDark ? 'text-indigo-400 group-hover:text-indigo-300' : 'text-indigo-600 group-hover:text-indigo-700'} transition-colors`} />
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Office Location</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      20830 Torrence Chapel Rd Ste 203<br />
                      Cornelius, NC 28031, United States
                    </p>
                    <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Remote-first • Available for in-person meetings
                    </p>
                  </div>
                  <svg className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'} group-hover:translate-x-1 transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>

                <a 
                  href="mailto:info@unisysinfotech.com"
                  className={`${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200'} border rounded-xl p-6 flex items-start space-x-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer animate-slide-up group`}
                  style={{animationDelay: '0.1s'}}
                >
                  <Mail className={`w-6 h-6 flex-shrink-0 mt-1 ${isDark ? 'text-indigo-400 group-hover:text-indigo-300' : 'text-indigo-600 group-hover:text-indigo-700'} transition-colors`} />
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Email</h3>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-300 group-hover:text-indigo-300' : 'text-slate-600 group-hover:text-indigo-600'} transition-colors`}>
                      info@unisysinfotech.com
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Response within 24 hours
                    </p>
                  </div>
                  <svg className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'} group-hover:translate-x-1 transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="animate-slide-in-right">
              <div className="mb-8">
                <h2 className={`text-3xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Get in Touch</h2>
                <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Fill out the form below and we'll respond within 24 hours.
                </p>
              </div>

              {submitStatus.message && (
                <div className={`mb-6 p-4 rounded-xl ${submitStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'} animate-fade-in`}>
                  <p className={submitStatus.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>{submitStatus.message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'} transition-all duration-200 outline-none`}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'} transition-all duration-200 outline-none`}
                    placeholder="your.email@company.com"
                    required
                  />
                </div>

                <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'} transition-all duration-200 outline-none`}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>

                <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'} transition-all duration-200 outline-none resize-none`}
                    placeholder="Tell us about your project or inquiry..."
                    required
                  ></textarea>
                </div>

                <div className="animate-slide-up" style={{animationDelay: '0.5s'}}>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Security Check: {captcha.num1} + {captcha.num2} = ? *
                  </label>
                  <input
                    type="number"
                    name="captchaAnswer"
                    value={formData.captchaAnswer}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'} transition-all duration-200 outline-none`}
                    placeholder="Enter the sum"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      Send Message
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
                
                <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  We typically respond within 24 hours
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className={`py-20 px-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Location with Map */}
          <div className="mt-12 animate-fade-in">
            {/* Google Maps Embed */}
            <div className={`${isDark ? 'glass-effect-dark' : 'glass-effect'} rounded-2xl overflow-hidden backdrop-blur-2xl h-96`}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3256.8397362847496!2d-80.88254!3d35.47684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88541d8e9c5a5555%3A0x1234567890abcdef!2s20830%20Torrence%20Chapel%20Rd%20Ste%20203%2C%20Cornelius%2C%20NC%2028031!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="UNISYS INFOTECH Office Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
