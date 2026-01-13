import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Clock, Globe } from 'lucide-react';
import { contactMessageApi } from '../api/endpoints.js';
import { toast } from 'react-toastify';

export const ContactPageNew = () => {
  const location = useLocation();
  const jobTitle = location.state?.jobTitle;
  const jobId = location.state?.jobId;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: jobTitle ? `I am interested in applying for the position: ${jobTitle}` : '',
    captcha: ''
  });

  const [errors, setErrors] = useState({});

  // Pre-fill message if coming from job application
  useEffect(() => {
    if (jobTitle) {
      setFormData(prev => ({
        ...prev,
        message: `I am interested in applying for the position: ${jobTitle}`
      }));
    }
  }, [jobTitle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validatePhone = (phone) => {
    // Allow digits, spaces, hyphens, parentheses, and plus sign
    const phoneRegex = /^[0-9\s\-()+ ]*$/;
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid phone number (e.g., (910) 555-1234)';
    }
    // Check if there are at least 10 digits
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return 'Phone number must contain at least 10 digits';
    }
    return '';
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      setErrors({ ...errors, phone: phoneError });
      toast.error(phoneError);
      return;
    }
    
    // Validate captcha
    if (parseInt(formData.captcha) !== 10) {
      toast.error('Incorrect answer to the math question. Please try again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send data to backend API
      const response = await contactMessageApi.submit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      });
      
      toast.success(response.data.message || 'Thank you for contacting us! We will get back to you soon.');
      
      // Reset form and errors
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        captcha: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error(error.response?.data?.message || 'Error submitting contact form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      details: 'info@unisysinfotech.com',
      link: 'mailto:info@unisysinfotech.com'
    },
    {
      icon: MapPin,
      title: 'Address',
      details: '20830 Torrence Chapel Rd Ste 203 Cornelius, NC, 28031',
      link: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-blue-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Get In Touch</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
            Contact Us
          </h1>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Intro Message */}
          <div className="text-center mb-16">
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              If you have an idea, we would like to hear about it please drop a message.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left - Contact Form */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#1a2942]/50 border border-blue-900/30 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#1a2942]/50 border border-blue-900/30 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-300 mb-2">
                    Your Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="[0-9\-()+ ]*"
                    required
                    className={`w-full px-4 py-3 rounded-lg bg-[#1a2942]/50 border ${errors.phone ? 'border-red-500' : 'border-blue-900/30'} text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-300 mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    maxLength="500"
                    required
                    rows="5"
                    className="w-full px-4 py-3 rounded-lg bg-[#1a2942]/50 border border-blue-900/30 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                    placeholder="Enter your message (max 500 characters)"
                  ></textarea>
                  <p className="mt-1 text-sm text-slate-400 text-right">
                    {formData.message.length}/500 characters
                  </p>
                </div>

                {/* Captcha Field */}
                <div>
                  <label htmlFor="captcha" className="block text-sm font-semibold text-slate-300 mb-2">
                    What is 5 + 5?
                  </label>
                  <input
                    type="number"
                    id="captcha"
                    name="captcha"
                    value={formData.captcha}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#1a2942]/50 border border-blue-900/30 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                    placeholder="Enter your answer"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Right - Contact Info */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
                Contact Information
              </h2>
              {contactInfo.map((info, idx) => {
                const InfoIcon = info.icon;
                return (
                  <a
                    key={idx}
                    href={info.link}
                    className="p-6 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-blue-900/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 flex items-start gap-4 block"
                  >
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <InfoIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold mb-2 text-white">{info.title}</h3>
                      <p className="text-slate-400 text-sm">{info.details}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center">
              Find Us Here
            </h2>
            <div className="rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-500/20">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3256.8!2d-80.879444!3d35.486833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88569d7e8e8e8e8e%3A0x8e8e8e8e8e8e8e8e!2s20830%20Torrence%20Chapel%20Rd%20Ste%20203%2C%20Cornelius%2C%20NC%2028031!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
                title="UNISYS INFOTECH Location - 20830 Torrence Chapel Rd Ste 203, Cornelius, NC 28031"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
