import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/index.js';
import { clientLogosApi } from '../api/endpoints.js';
import { 
  ArrowRight, CheckCircle2, Star, Users, TrendingUp, Shield, 
  Zap, Globe, BarChart3, Clock, Award, ChevronRight, Play, Code, 
  Database, Cloud, GitBranch, Brain, Target, Briefcase, MessageCircle
} from 'lucide-react';

export const HomePageNew = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [clientLogos, setClientLogos] = useState([]);
  const [logosLoading, setLogosLoading] = useState(true);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [rotatingWord, setRotatingWord] = useState(0);
  
  // Rotating words for heading
  const words = ['Success', 'Revenue', 'Growth'];

  // Services for animation
  const services = [
    { 
      icon: Code, 
      name: 'Software Development', 
      description: 'Software Development services is your possibility to outsource software engineering and support, and get maintainable, secure and impactful software at the best price.',
      color: 'text-blue-400', 
      bgColor: 'bg-blue-500/10' 
    },
    { 
      icon: Shield, 
      name: 'QA Automation', 
      description: 'Comprehensive quality assurance and automated testing services to ensure your software meets the highest standards of quality and reliability.',
      color: 'text-green-400', 
      bgColor: 'bg-green-500/10' 
    },
    { 
      icon: GitBranch, 
      name: 'DevOps', 
      description: 'DevOps is a set of practices, tools, and a cultural philosophy that automate and integrate the processes between software development and IT teams.',
      color: 'text-purple-400', 
      bgColor: 'bg-purple-500/10' 
    },
    { 
      icon: Cloud, 
      name: 'Cloud Services', 
      description: 'Scalable cloud infrastructure solutions that help you deploy, manage, and optimize your applications across multiple cloud platforms.',
      color: 'text-cyan-400', 
      bgColor: 'bg-cyan-500/10' 
    },
    { 
      icon: Database, 
      name: 'Database Administration', 
      description: 'Expert database management, optimization, and maintenance services to ensure your data infrastructure runs smoothly and efficiently.',
      color: 'text-orange-400', 
      bgColor: 'bg-orange-500/10' 
    },
    { 
      icon: Target, 
      name: 'CRM', 
      description: 'CRM (customer relationship management) software tracks and manages customer relationships. It records interactions between a business, its prospects, and its existing customers.',
      color: 'text-pink-400', 
      bgColor: 'bg-pink-500/10' 
    },
    { 
      icon: Brain, 
      name: 'Data Science', 
      description: 'Build expertise in data manipulation, visualization, predictive analytics, machine learning, and data science to launch or advance a successful data career.',
      color: 'text-indigo-400', 
      bgColor: 'bg-indigo-500/10' 
    }
  ];

  // Animate services rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveServiceIndex((prev) => (prev + 1) % services.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [services.length]);

  // Animate rotating words every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingWord((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [words.length]);

  // Preload images for faster display
  const preloadImages = (imageUrls) => {
    imageUrls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
      
      // Also preload using Image API for better caching
      const img = new Image();
      img.src = url;
    });
  };

  // Fetch client logos with image preloading
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        setLogosLoading(true);
        const response = await clientLogosApi.getAll();
        const logos = response.data || [];
        setClientLogos(logos);
        
        // Preload all logo images immediately for instant display
        if (logos.length > 0) {
          const imageUrls = logos.map(logo => logo.logoUrl).filter(Boolean);
          preloadImages(imageUrls);
        }
      } catch (error) {
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
          console.warn('Backend server is not running. Client logos will not be displayed.');
        } else {
          console.error('Error fetching client logos:', error.message || error);
        }
        setClientLogos([]);
      } finally {
        setLogosLoading(false);
      }
    };
    fetchLogos();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden rounded-b-[120px]">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-blue-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(37,99,235,0.1),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto text-center z-10 px-2 sm:px-4">
          {/* Main Heading */}
          <h1 
            className="font-bold mb-6 leading-[1.15]" 
            style={{ 
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
              fontSize: 'clamp(2rem, 6vw + 0.5rem, 5rem)'
            }}
          >
            <span className="text-white animate-fade-in-up opacity-0 block" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              Empowering Your Business with
            </span>
            <span className="text-slate-400 animate-fade-in-up opacity-0 block mt-2" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              Real-time Solutions for
            </span>
            <span className="animate-fade-in-up opacity-0 block mt-2" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
              <span 
                key={rotatingWord}
                className="text-blue-400 inline-block animate-word-fade font-bold"
                style={{ 
                  minWidth: 'clamp(100px, 18vw, 220px)',
                  fontSize: 'clamp(2rem, 6vw + 0.5rem, 5rem)'
                }}
              >
                {words[rotatingWord]}
              </span>
            </span>
          </h1>

          {/* Subheading */}
          <p 
            className="text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed"
            style={{ fontSize: 'clamp(1.1rem, 2vw + 0.4rem, 1.5rem)' }}
          >
            Empower your team with an all-in-one solution designed to streamline workflows, boost collaboration, and drive productivity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              to="/contact"
              className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              Contact Us
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/services"
              className="px-8 py-4 bg-[#1a2942] hover:bg-[#1f2f47] border border-blue-900/50 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              Explore Our Services
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Client Logos Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent rounded-t-[120px] -mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              Trusted by Leading Organizations
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto rounded-full"></div>
          </div>

          {/* Client Logos Display */}
          <div className={`relative overflow-hidden ${clientLogos.length === 1 ? 'flex justify-center' : ''}`}>
            {logosLoading ? (
              /* Skeleton Loading for Client Logos */
              <div className="flex justify-center items-center gap-6 md:gap-10 flex-wrap py-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={`skeleton-${i}`} className="animate-pulse">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6">
                      <div className="h-16 md:h-20 w-[120px] md:w-[160px] bg-white/20 rounded-lg"></div>
                    </div>
                    <div className="h-3 w-20 bg-white/10 rounded mx-auto mt-2"></div>
                  </div>
                ))}
              </div>
            ) : clientLogos.length > 0 ? (
              <div className={clientLogos.length === 1 ? 'flex justify-center' : ''}>
                {/* Gradient fade on edges for scrolling view - only show if more than 1 logo */}
                {clientLogos.length > 1 && (
                  <>
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0a1628] to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0a1628] to-transparent z-10 pointer-events-none"></div>
                  </>
                )}
                
                <div 
                  className="flex animate-scroll-left hover:pause-animation"
                  style={{ 
                    width: 'max-content',
                    animationDuration: `${Math.max(10, clientLogos.length * 3)}s`
                  }}
                >
                  {/* Two sets for seamless infinite circular scrolling - shows exact number of logos */}
                  {[...Array(2)].map((_, setIndex) => (
                    <div key={`set-${setIndex}`} className="flex">
                      {clientLogos.map((logo, logoIndex) => (
                        <div 
                          key={`${logo._id || logo.id}-set${setIndex}-${logoIndex}`} 
                          className="flex-shrink-0 mx-6 md:mx-10 group"
                        >
                          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6 transition-all duration-300 group-hover:bg-white/10 group-hover:border-blue-500/30 group-hover:scale-105">
                            <img 
                              src={logo.logoUrl} 
                              alt={logo.name || 'Client Logo'}
                              loading="eager"
                              fetchPriority="high"
                              decoding="async"
                              className="h-16 md:h-20 w-auto max-w-[150px] md:max-w-[200px] object-contain filter brightness-90 group-hover:brightness-100 transition-all duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                              onLoad={(e) => {
                                e.target.style.opacity = '1';
                              }}
                              style={{ opacity: 0, transition: 'opacity 0.3s' }}
                            />
                          </div>
                          {logo.name && (
                            <p className="text-slate-400 text-xs md:text-sm text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              {logo.name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <p>Client logos coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                About Us
              </h2>
              <h3 className="text-2xl font-semibold text-blue-400 mb-4">UNISYS INFOTECH's Story</h3>
              <p className="text-slate-300 mb-4 leading-relaxed">
                Our experienced and professional team are able to help you find the right strategic solution for your business including: reshaping hierarchies, company audits, marketing, and helping you to identify ways of streamlining workflow processes.
              </p>
              <p className="text-slate-300 mb-4 leading-relaxed">
                Our comprehensive range of services means you can rely on and trust us to deliver a suite of effective solutions for your organisation. IT outsourcing services include application development, infrastructure and software support and maintenance.
              </p>
              <p className="text-slate-300 mb-4 leading-relaxed">
                When we started building software products and data services, doing what's best for our employees and customers was second nature. As we've grown to a successful and strong company, we are thankful that we have the opportunity make an even bigger impact on our customers.
              </p>
              <p className="text-slate-300 mb-6 leading-relaxed">
                It's our privilege to forge meaningful, long-term relationship with the customers, partners and non-profit organizations that shape our vision and values. These relationships make us who we are – a united, engaged workforce that is dedicated to being a positive presence around the globe.
              </p>
              
              <h3 className="text-2xl font-semibold text-blue-400 mb-4 mt-8">Our Services</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                UNISYS INFOTECH brings a wide array of IT and business consulting skills and a long history of experience across many industries that allows us to expertly tailor our services and solutions to match your business or organizational needs. <span className="text-blue-400 font-semibold">On Time. On Budget. Exceeding Expectations.</span>
              </p>
              
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300"
              >
                To Know More Contact Us
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-500/20">
                <img 
                  src="/unysisinotechoffice.png" 
                  alt="UNISYS INFOTECH Office"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-[#0f1d35]/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What We Do
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Our Best Services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: 'Software Development',
                shortTitle: 'Software Development',
                description: 'Software Development services is your possibility to outsource software engineering and support, and get maintainable, secure and impactful software at the best price.',
                link: '/services/software-development'
              },
              {
                icon: Shield,
                title: 'QA Automation',
                description: 'Comprehensive quality assurance and automated testing services to ensure your software meets the highest standards of quality and reliability.',
                link: '/services/qa'
              },
              {
                icon: Zap,
                title: 'DevOps',
                description: 'DevOps is a set of practices, tools, and a cultural philosophy that automate and integrate the processes between software development and IT teams.',
                link: '/services/devops'
              },
              {
                icon: Globe,
                title: 'Cloud Services',
                description: 'Scalable cloud infrastructure solutions that help you deploy, manage, and optimize your applications across multiple cloud platforms.',
                link: '/services/cloud-services'
              },
              {
                icon: Users,
                title: 'Database Administration',
                shortTitle: 'Database Administration',
                description: 'Expert database management, optimization, and maintenance services to ensure your data infrastructure runs smoothly and efficiently.',
                link: '/services/dba'
              },
              {
                icon: Award,
                title: 'CRM',
                description: 'CRM (customer relationship management) software tracks and manages customer relationships. It records interactions between a business, its prospects, and its existing customers.',
                link: '/services/crm'
              },
              {
                icon: TrendingUp,
                title: 'Data Science',
                description: 'Build expertise in data manipulation, visualization, predictive analytics, machine learning, and data science to launch or advance a successful data career.',
                link: '/services/data-science'
              },
              {
                icon: Briefcase,
                title: 'Professional Services',
                description: 'IT Professional Services can be defined as the delivery of technology-related services to a customer, allowing them to focus on their core business concerns.',
                link: '/services/professional'
              }
            ].map((feature, idx) => (
              <Link
                key={idx}
                to={feature.link || '/services'}
                className="group p-8 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-blue-900/30 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 block"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.shortTitle || feature.title}</h3>
                <p className="text-slate-400 mb-4">{feature.description}</p>
                <div className="flex items-center gap-2 text-blue-400 group-hover:gap-3 transition-all">
                  <span className="text-sm font-semibold">Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Us
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              We Can Give the Best Services for Business
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-blue-900/30">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Outcome-Driven Focus</h3>
              <p className="text-slate-300 leading-relaxed">
                It comes down to our service, outcome-driven focus, expertise, stability, and in-depth approach to understanding 
                the technological environment and business needs of our clients so we can develop a customized plan that prioritizes their goals.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-blue-900/30">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Trusted Partnership</h3>
              <p className="text-slate-300 leading-relaxed">
                As a partner, we bring trusted, outcome-driven solutions and services that expand the boundaries of technology and innovation, 
                while advancing client-specified, mission-critical objectives on a daily basis.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-blue-900/30">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Complete Solutions</h3>
              <p className="text-slate-300 leading-relaxed">
                UNISYS INFOTECH provides the expertise necessary to navigate goals and select the best approach to leveraging assets 
                and direction for a complete end-to-end solution.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-blue-900/30">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Innovation & Risk-Taking</h3>
              <p className="text-slate-300 leading-relaxed">
                We're innovative, and we focus on understanding our clients technical and business needs to ensure the satisfaction of their end-users. 
                We know our client's strategic IT decisions may bring mission-critical impacts, but we are not afraid to take risks if it helps achieve our goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Want to Work with Us CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 md:p-16">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Want to Work with Us?
              </h2>
              
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Let's collaborate to transform your ideas into reality. Our team of experts is ready to help you achieve your business goals with innovative solutions.
              </p>
              
              <div className="flex justify-center">
                <Link
                  to="/careers"
                  className="group px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  See Career Opportunities
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Contact Us Button */}
      <Link
        to="/contact"
        className="fixed bottom-8 right-8 z-50 group"
      >
        <div className="relative">
          {/* Pulsing ring animation */}
          <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-75"></div>
          
          {/* Main button */}
          <div className="relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110">
            <MessageCircle className="w-6 h-6" />
            <span className="font-semibold hidden sm:inline">Contact Us</span>
          </div>
        </div>
      </Link>

    </div>
  );
};
