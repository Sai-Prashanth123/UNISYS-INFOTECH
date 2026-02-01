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
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const heroPointerStartX = React.useRef(null);

  // Hero carousel slides (background + "logo"/icon + CTA)
  const heroSlides = [
    {
      key: 'cloud',
      title: 'Cloud Services',
      subtitle: 'Modernize, migrate, and optimize across multi-cloud with secure, scalable architecture.',
      icon: Cloud,
      accent: 'text-cyan-300',
      cta: { label: 'Explore Cloud', to: '/services/cloud-services' },
      backgroundImage:
        'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1920&h=1080&fit=crop&auto=format&q=80',
    },
    {
      key: 'outsourcing',
      title: 'IT Outsourcing Services',
      subtitle: 'Extend your team with proven delivery, measurable outcomes, and reliable support.',
      icon: Briefcase,
      accent: 'text-indigo-300',
      cta: { label: 'Explore Professional', to: '/services/professional' },
      backgroundImage:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&h=1080&fit=crop&auto=format&q=80',
    },
    {
      key: 'software',
      title: 'Software Development',
      subtitle: 'Build maintainable, secure, high-impact software—delivered on time and on budget.',
      icon: Code,
      accent: 'text-blue-300',
      cta: { label: 'Explore Development', to: '/services/software-development' },
      backgroundImage:
        'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1920&h=1080&fit=crop&auto=format&q=80',
    },
    {
      key: 'devops',
      title: 'DevOps',
      subtitle: 'Automate CI/CD, improve reliability, and ship faster with modern DevOps practices.',
      icon: GitBranch,
      accent: 'text-purple-300',
      cta: { label: 'Explore DevOps', to: '/services/devops' },
      backgroundImage:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop&auto=format&q=80',
    },
    {
      key: 'data',
      title: 'Data & Analytics',
      subtitle: 'Turn data into decisions with BI and data science solutions tailored to your business.',
      icon: BarChart3,
      accent: 'text-emerald-300',
      cta: { label: 'Explore BI', to: '/services/business-intelligence' },
      backgroundImage:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=1080&fit=crop&auto=format&q=80',
    },
  ];

  const goToHeroSlide = (idx) => {
    const next = ((idx % heroSlides.length) + heroSlides.length) % heroSlides.length;
    setHeroSlideIndex(next);
  };

  const goPrevHeroSlide = () => goToHeroSlide(heroSlideIndex - 1);
  const goNextHeroSlide = () => goToHeroSlide(heroSlideIndex + 1);

  // Auto-advance hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

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
        const imageUrls = [
          ...heroSlides.map((s) => s.backgroundImage).filter(Boolean),
          ...logos.map((logo) => logo.logoUrl).filter(Boolean),
        ];
        if (imageUrls.length > 0) preloadImages(imageUrls);
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
      <section
        className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14 md:py-20 overflow-hidden rounded-b-[60px] sm:rounded-b-[80px] md:rounded-b-[120px]"
        aria-label="Homepage hero carousel"
      >
        {/* Slides rail */}
        <div
          className="absolute inset-0"
          onPointerDown={(e) => {
            heroPointerStartX.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (heroPointerStartX.current === null) return;
            const delta = e.clientX - heroPointerStartX.current;
            heroPointerStartX.current = null;
            if (Math.abs(delta) < 60) return;
            if (delta > 0) goPrevHeroSlide();
            else goNextHeroSlide();
          }}
          onPointerCancel={() => {
            heroPointerStartX.current = null;
          }}
        >
          <div
            className="h-full w-full flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${heroSlideIndex * 100}%)` }}
          >
            {heroSlides.map((slide) => {
              const Icon = slide.icon;
              return (
                <div
                  key={slide.key}
                  className="relative w-full flex-shrink-0"
                  style={{
                    backgroundImage: `url('${slide.backgroundImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Dark overlay + branded gradients for readability */}
                  <div className="absolute inset-0 bg-black/60"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/35 via-[#0f1d35]/35 to-transparent"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.18),transparent_55%)]"></div>

                  <div className="relative z-10 h-full flex items-center">
                    <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6">
                      <div className="grid lg:grid-cols-12 gap-8 items-center">
                        {/* Left: copy */}
                        <div className="lg:col-span-7 text-left">
                          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-5">
                            <Icon className={`w-5 h-5 ${slide.accent}`} />
                            <span className="text-xs sm:text-sm font-semibold text-white/90">
                              Our Services
                            </span>
                          </div>

                          <h1
                            className="font-bold leading-[1.08] text-white"
                            style={{
                              fontFamily:
                                "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
                              fontSize: 'clamp(2.1rem, 5vw + 0.5rem, 4.8rem)',
                            }}
                          >
                            {slide.title}
                          </h1>
                          <p
                            className="mt-4 text-slate-200 max-w-2xl leading-relaxed"
                            style={{ fontSize: 'clamp(1.05rem, 1.2vw + 0.5rem, 1.4rem)' }}
                          >
                            {slide.subtitle}
                          </p>

                          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <Link
                              to={slide.cta.to}
                              className="group px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/30"
                            >
                              {slide.cta.label}
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                              to="/contact"
                              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              Contact Us
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>

                        {/* Right: big “logo” */}
                        <div className="lg:col-span-5 hidden lg:flex justify-center">
                          <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                            <div className="relative w-44 h-44 xl:w-56 xl:h-56 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                              <Icon className={`w-20 h-20 xl:w-28 xl:h-28 ${slide.accent}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-6 sm:bottom-8 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrevHeroSlide}
              className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-sm flex items-center justify-center transition-all active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronRight className="w-5 h-5 rotate-180 text-white" />
            </button>

            <div className="flex items-center gap-2">
              {heroSlides.map((s, idx) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => goToHeroSlide(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === heroSlideIndex ? 'w-10 bg-blue-400' : 'w-2.5 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNextHeroSlide}
              className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-sm flex items-center justify-center transition-all active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* Client Logos Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent rounded-t-[60px] sm:rounded-t-[80px] md:rounded-t-[120px] -mt-10 sm:-mt-16 md:-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 px-4">
              Trusted by Leading Organizations
            </h2>
            <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto rounded-full"></div>
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
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">
                About Us
              </h2>
              <h3 className="text-xl sm:text-2xl font-semibold text-blue-400 mb-3 sm:mb-4">UNISYS INFOTECH's Story</h3>
              <p className="text-slate-300 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                Our experienced and professional team are able to help you find the right strategic solution for your business including: reshaping hierarchies, company audits, marketing, and helping you to identify ways of streamlining workflow processes.
              </p>
              <p className="text-slate-300 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                Our comprehensive range of services means you can rely on and trust us to deliver a suite of effective solutions for your organisation. IT outsourcing services include application development, infrastructure and software support and maintenance.
              </p>
              <p className="text-slate-300 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                When we started building software products and data services, doing what's best for our employees and customers was second nature. As we've grown to a successful and strong company, we are thankful that we have the opportunity make an even bigger impact on our customers.
              </p>
              <p className="text-slate-300 mb-6 leading-relaxed">
                It's our privilege to forge meaningful, long-term relationship with the customers, partners and non-profit organizations that shape our vision and values. These relationships make us who we are – a united, engaged workforce that is dedicated to being a positive presence around the globe.
              </p>
              
              <h3 className="text-xl sm:text-2xl font-semibold text-blue-400 mb-3 sm:mb-4 mt-6 sm:mt-8">Our Services</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                UNISYS INFOTECH brings a wide array of IT and business consulting skills and a long history of experience across many industries that allows us to expertly tailor our services and solutions to match your business or organizational needs. <span className="text-blue-400 font-semibold">On Time. On Budget. Exceeding Expectations.</span>
              </p>
              
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300"
              >
                To Know More Contact Us
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-transparent via-[#0f1d35]/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              What We Do
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Our Best Services
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                className="group p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-blue-900/30 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 block"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.shortTitle || feature.title}</h3>
                <p className="text-slate-400 mb-3 sm:mb-4 text-sm sm:text-base">{feature.description}</p>
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
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Why Choose Us
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
              We Can Give the Best Services for Business
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-blue-900/30">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3 sm:mb-4">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Outcome-Driven Focus</h3>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
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
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 sm:p-12 md:p-16">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4 sm:mb-6">
                <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
                Want to Work with Us?
              </h2>
              
              <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
                Let's collaborate to transform your ideas into reality. Our team of experts is ready to help you achieve your business goals with innovative solutions.
              </p>
              
              <div className="flex justify-center">
                <Link
                  to="/careers"
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  See Career Opportunities
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Contact Us Button */}
      <Link
        to="/contact"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 group"
      >
        <div className="relative">
          {/* Pulsing ring animation */}
          <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-75"></div>
          
          {/* Main button */}
          <div className="relative flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-semibold hidden sm:inline text-sm sm:text-base">Contact Us</span>
          </div>
        </div>
      </Link>

    </div>
  );
};
