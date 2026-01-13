import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/index.js';
import { clientLogosApi } from '../api/endpoints.js';
import { Button } from '../components/ui/Button.jsx';
import { Card, ServiceCard, TestimonialCard } from '../components/ui/Card.jsx';
import { Badge, SecurityBadge } from '../components/ui/Badge.jsx';
import { Section, SectionHeading } from '../components/ui/Section.jsx';
import { AnimatedServicesNetwork } from '../components/AnimatedServicesNetwork.jsx';
import { 
  Code, Cloud, Database, CheckSquare, Briefcase, Users, ArrowRight, 
  CheckCircle2, GitBranch, Brain, BarChart3, Shield, Award, Clock, 
  Headphones, Lock, TrendingUp, Globe, PhoneCall, MessageSquare, Star, Zap, Calendar,
  ChevronLeft, ChevronRight
} from 'lucide-react';

// Counter Animation Component
const AnimatedCounter = ({ end, suffix = '', duration = 2000, isDark }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, end, duration]);

  return (
    <div ref={ref} className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {count}{suffix}
    </div>
  );
};

export const HomePage = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [clientLogos, setClientLogos] = useState([]);
  const [logosLoading, setLogosLoading] = useState(true);
  const [logosError, setLogosError] = useState(null);

  // Show floating CTA after scrolling
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch client logos
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        setLogosLoading(true);
        setLogosError(null);
        const response = await clientLogosApi.getAll();
        console.log('Client logos fetched successfully:', response.data.length);
        setClientLogos(response.data);
      } catch (error) {
        console.error('Error fetching client logos:', error);
        setLogosError(error.message);
        // Set empty array on error so it doesn't keep showing loading
        setClientLogos([]);
      } finally {
        setLogosLoading(false);
      }
    };
    fetchLogos();
  }, []);

  const trustMetrics = [
    { number: 15, suffix: '+', label: 'Years Experience' },
    { number: 50, suffix: '+', label: 'Enterprise Clients' },
    { number: 200, suffix: '+', label: 'Projects Delivered' },
    { number: 98, suffix: '%', label: 'Client Retention' }
  ];

  const testimonials = [
    {
      quote: "UNISYS INFOTECH delivered a complete Oracle Cloud migration that reduced our operational costs by <strong>40%</strong> while improving system performance. Their team felt like an extension of our own - professional, responsive, and truly invested in our success.",
      author: "Sarah Johnson",
      role: "CTO",
      company: "TechCorp Solutions",
      rating: 5
    },
    {
      quote: "The custom CRM they built transformed how we manage customer relationships. Response times dropped from days to hours, and our sales team's <strong>productivity increased by 60%</strong>. Best tech investment we've made.",
      author: "Michael Chen",
      role: "VP of Sales",
      company: "GrowthLabs Inc",
      rating: 5
    },
    {
      quote: "We needed DevOps expertise to scale our platform. UNISYS INFOTECH integrated seamlessly, reduced deployment time by <strong>75%</strong>, and helped us achieve <strong>99.9% uptime</strong>. Game-changer for our team.",
      author: "David Martinez",
      role: "Engineering Director",
      company: "CloudScale Systems",
      rating: 5
    }
  ];

  // All services with full content
  const allServices = [
    {
      id: 0,
      title: 'Software Development',
      shortTitle: 'Software Development',
      icon: Code,
      description: 'Software Development services is your possibility to outsource software engineering and support, and get maintainable, secure and impactful software at the best price.',
      detail: 'Software product development helps create marketable commercial software for business users or individual consumers. UNISYS INFOTECH provides outsourced product development services to design, architect and implement user-friendly and engaging software products.',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop',
      link: '/services/software-development'
    },
    {
      id: 1,
      title: 'QA Automation',
      shortTitle: 'QA Automation',
      icon: CheckSquare,
      description: 'We Deliver Automation Testing Services that Guarantee Quality & ROI',
      detail: "Despite the countless benefits of Automation testing, it is not easy to achieve. You'll have to choose the right tools, build automation test suites, and need a team of scripting experts to overcome the challenges. Or you could ease everything with Codoid on your team.",
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop',
      link: '/services/qa'
    },
    {
      id: 2,
      title: 'DevOps',
      shortTitle: 'DevOps',
      icon: GitBranch,
      description: 'DevOps is a set of practices, tools, and a cultural philosophy that automate and integrate the processes between software development and IT teams. It emphasizes team empowerment, cross-team communication and collaboration, and technology automation.',
      detail: 'Under a DevOps model, development and operations teams are no longer "siloed." Sometimes, these two teams merge into a single team where the engineers work across the entire application lifecycle - from development and test to deployment and operations - and have a range of multidisciplinary skills.',
      image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&h=400&fit=crop',
      link: '/services/devops'
    },
    {
      id: 3,
      title: 'Cloud Services',
      shortTitle: 'Cloud Services',
      icon: Cloud,
      description: 'The cloud is a managed service, but it isn\'t managing itself. Elevate your cloud to new heights with services built for the complex multicloud world.Our integrated approach to cloud data management and storage helps you get the day-to-day tasks right and take charge.',
      detail: '',
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop',
      link: '/services/cloud-services'
    },
    {
      id: 4,
      title: 'Database Administration',
      shortTitle: 'Database Administration',
      icon: Database,
      description: 'A database administrator (DBA) is a person who manages, maintains, and secures data in one or more data systems so that a user can perform analysis for business operations. DBAs take care of data storage, organization, presentation, utilization, and analysis from a technical perspective.',
      detail: 'The DBA job is transitioning from being database-centric to data-centric, as Data Management becomes more autonomous.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      link: '/services/dba'
    }
  ];

  const [selectedService, setSelectedService] = useState(allServices[0]); // Default to Software Development

  // Navigation handlers
  const handlePrevious = () => {
    setSelectedService((current) => {
      const currentIndex = allServices.findIndex(s => s.id === current.id);
      const prevIndex = (currentIndex - 1 + allServices.length) % allServices.length;
      return allServices[prevIndex];
    });
  };

  const handleNext = () => {
    setSelectedService((current) => {
      const currentIndex = allServices.findIndex(s => s.id === current.id);
      const nextIndex = (currentIndex + 1) % allServices.length;
      return allServices[nextIndex];
    });
  };

  const whyChoosePoints = [
    {
      icon: Award,
      title: 'Proven Track Record',
      desc: 'Over 200 successful projects delivered for Fortune 500 companies and fast-growing startups across healthcare, finance, retail, and technology sectors.',
      badge: '200+ Projects'
    },
    {
      icon: Users,
      title: 'Dedicated Teams',
      desc: 'Stable, senior-level engineers who become true partners - not rotating contractors. Average engagement length: 3+ years.',
      badge: '3+ Year Avg'
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      desc: 'SOC 2 compliant with ISO 27001 processes. NDA protection, secure code practices, and compliance with HIPAA, GDPR, and industry standards.',
      badge: 'SOC 2 Compliant'
    },
    {
      icon: TrendingUp,
      title: 'Business-Focused',
      desc: 'We don\'t just write code - we drive outcomes. Every project is measured against clear KPIs and business impact metrics.',
      badge: 'ROI-Driven'
    },
    {
      icon: Clock,
      title: 'Fast Time-to-Value',
      desc: 'Onboard in days, not months. Our proven processes and experienced teams mean you see results in the first sprint.',
      badge: 'Days to Start'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      desc: 'Round-the-clock monitoring and support for mission-critical systems. We\'re there when you need us most.',
      badge: 'Always Available'
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Floating CTA Button */}
      {showFloatingCTA && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up shadow-2xl">
          <Button 
            to="/contact"
            variant="primary"
            icon={<PhoneCall size={20} />}
            iconPosition="left"
            className="px-6 py-4 rounded-full hover:scale-105"
          >
            Contact Us
          </Button>
        </div>
      )}

      {/* Hero Section - With Background Image */}
      <section className={`relative overflow-hidden py-20 px-4 min-h-[700px] flex items-center`}>
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop')`,
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className={`absolute inset-0 ${isDark ? 'bg-slate-900/85' : 'bg-slate-900/75'}`}></div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Main Message */}
            <div className="animate-slide-in-left">
              {/* Trust indicator above headline */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-white/10 backdrop-blur-sm border border-white/20`}>
                <CheckCircle2 size={18} className="text-cyan-400" />
                <span className="text-sm font-semibold text-white">
                  Trusted by 50+ Enterprise Teams · Serving Clients Across the US
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-[1.1]">
                <span className="text-white">
                  Scale Your SaaS Engineering Team
                </span>
                <br />
                <span className="text-cyan-400">
                  Without the Hiring Overhead
                </span>
              </h1>
              
              <p className="text-xl mb-10 leading-relaxed max-w-2xl text-slate-200">
                Access <strong className="text-white">senior software engineers, DevOps specialists, and data experts</strong> who deliver results from day one - no recruiting delays, no onboarding overhead.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  to="/contact" 
                  size="lg" 
                  variant="primary" 
                  icon={<ArrowRight size={20} />}
                  iconPosition="right"
                >
                  Contact Us
                </Button>
                <Button 
                  to="/services" 
                  size="lg" 
                  variant={isDark ? 'secondaryDark' : 'secondary'}
                >
                  Explore Services
                </Button>
              </div>

              {/* Key proof bullets */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-white/10 backdrop-blur-sm">
                    <CheckCircle2 size={16} className="text-cyan-400" />
                  </div>
                  <p className="text-lg text-slate-200">
                    <strong className="text-white">98% client retention</strong> rate · Long-term partnerships, not projects
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-white/10 backdrop-blur-sm">
                    <CheckCircle2 size={16} className="text-cyan-400" />
                  </div>
                  <p className="text-lg text-slate-200">
                    <strong className="text-white">Onboard in days</strong> · Stable, dedicated teams aligned with your goals
                  </p>
                </div>
              </div>
            </div>

            {/* Right column - Animated Services Network */}
            <div className="relative h-[500px] animate-slide-in-right">
              <AnimatedServicesNetwork />
            </div>
          </div>
        </div>
      </section>

      {/* Client Logos Section */}
      <section className={`py-16 px-4 ${isDark ? 'bg-slate-900' : 'bg-white'} overflow-hidden`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'} tracking-wide uppercase`}>
              Trusted by Leading Organizations
            </p>
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Our Clients
            </h2>
          </div>

          {logosLoading ? (
            /* Skeleton Loading for Client Logos */
            <div className="flex justify-center items-center gap-6 md:gap-10 flex-wrap py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={`skeleton-${i}`} className="animate-pulse">
                  <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-xl p-4 md:p-6`}>
                    <div className={`h-16 md:h-20 w-[120px] md:w-[160px] ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded-lg`}></div>
                  </div>
                  <div className={`h-3 w-20 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded mx-auto mt-2`}></div>
                </div>
              ))}
            </div>
          ) : logosError ? (
            <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <p>Unable to load client logos at this time.</p>
            </div>
          ) : clientLogos.length > 0 ? (
            <div className="relative">
              {/* Gradient overlays for smooth fade effect */}
              <div className={`absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none ${isDark ? 'bg-gradient-to-r from-slate-900 to-transparent' : 'bg-gradient-to-r from-white to-transparent'}`}></div>
              <div className={`absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none ${isDark ? 'bg-gradient-to-l from-slate-900 to-transparent' : 'bg-gradient-to-l from-white to-transparent'}`}></div>
              
              {/* Scrolling container */}
              <div className="flex animate-scroll hover:pause-animation">
                {/* First set of logos */}
                {clientLogos.map((logo, idx) => (
                  <div 
                    key={`logo-1-${logo._id || idx}`} 
                    className={`flex-shrink-0 w-48 mx-6 flex items-center justify-center p-6 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} group transition-all`}
                    title={`${logo.name} - ${logo.industry}`}
                  >
                    <img 
                      src={logo.logoUrl} 
                      alt={logo.name}
                      className="max-w-full max-h-16 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <span className={`hidden text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{logo.name}</span>
                  </div>
                ))}
                {/* Duplicate set for infinite scroll */}
                {clientLogos.map((logo, idx) => (
                  <div 
                    key={`logo-2-${logo._id || idx}`} 
                    className={`flex-shrink-0 w-48 mx-6 flex items-center justify-center p-6 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} group transition-all`}
                    title={`${logo.name} - ${logo.industry}`}
                  >
                    <img 
                      src={logo.logoUrl} 
                      alt={logo.name}
                      className="max-w-full max-h-16 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <span className={`hidden text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{logo.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <p>No client logos available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Services Section - Simple Card Layout */}
      <section className={`py-20 px-4 ${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-800' : 'bg-gradient-to-b from-blue-900 to-blue-800'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-cyan-400 text-sm font-semibold mb-3 tracking-wide uppercase">What We do</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Best Services</h2>
          </div>

          {/* Service Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {allServices.map((service, idx) => {
              const ServiceIcon = service.icon;
              const isSelected = selectedService.id === service.id;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedService(service)}
                  className={`${
                    isSelected
                      ? 'bg-gradient-to-br from-cyan-400 to-cyan-500 shadow-2xl shadow-cyan-500/50' 
                      : 'bg-white/10 backdrop-blur-md border border-white/20'
                  } rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl cursor-pointer hover:bg-white/20`}
                >
                  <ServiceIcon 
                    size={40} 
                    className={isSelected ? 'text-white mb-4' : 'text-cyan-400 mb-4'} 
                  />
                  <h3 className={`${
                    isSelected ? 'text-white' : 'text-white'
                  } font-bold text-lg`}>
                    {service.title}
                  </h3>
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={handlePrevious}
              className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-cyan-400 hover:border-cyan-400 text-white rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-cyan-500/50"
              aria-label="Previous service"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-cyan-400 hover:border-cyan-400 text-white rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-cyan-500/50"
              aria-label="Next service"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Featured Service Showcase */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl transition-all duration-500"
            key={selectedService.id}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Image */}
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={selectedService.image}
                  alt={selectedService.shortTitle}
                  className="w-full h-80 object-cover transition-opacity duration-500"
                />
              </div>

              {/* Content */}
              <div className="text-white">
                <h3 className="text-3xl font-bold mb-4 transition-opacity duration-500">
                  {selectedService.shortTitle}
                </h3>
                <p className="text-slate-200 mb-4 leading-relaxed transition-opacity duration-500">
                  {selectedService.description}
                </p>
                {selectedService.detail && (
                  <p className="text-slate-300 mb-6 leading-relaxed transition-opacity duration-500">
                    {selectedService.detail}
                  </p>
                )}
                <Link
                  to={selectedService.link}
                  className="inline-block px-6 py-3 bg-cyan-400 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us - STRATEGIC PARTNER POSITIONING */}
      <Section padding="default" background="alt" isDark={isDark}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop" 
                alt="Our Team" 
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
            <div className="animate-slide-in-right">
              <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'} tracking-wide uppercase`}>
                About UNISYS INFOTECH
              </p>
              <h2 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Your Strategic Technology Partner
              </h2>
              
              <p className={`text-lg mb-4 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                UNISYS INFOTECH has grown from a small consulting firm to a trusted technology partner for enterprises and high-growth companies across the United States.
              </p>
              
              <p className={`text-lg mb-4 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                We specialize in delivering <strong>enterprise-grade software engineering, cloud infrastructure, DevOps automation, and data solutions</strong> that drive measurable business impact.
              </p>
              
              <p className={`text-lg mb-6 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                Our approach combines deep technical expertise with business acumen - we don't just build technology, we solve business problems and accelerate your path to growth.
              </p>
              
              {/* Mission/Vision */}
              <div className={`p-6 rounded-xl mb-6 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Our Mission
                </h3>
                <p className={`text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  To empower businesses with reliable, scalable technology solutions that enable them to compete and win in their markets - delivered by stable, dedicated teams who become true extensions of your organization.
                </p>
              </div>
              
              <Button 
                to="/about"
                variant="primary"
                icon={<ArrowRight size={18} />}
                iconPosition="right"
              >
                Learn More About Us
              </Button>
            </div>
          </div>
      </Section>

      {/* Careers Section - CULTURE & GROWTH */}
      <Section padding="default" background="alt" isDark={isDark}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'} tracking-wide uppercase`}>
                Build Your Career
              </p>
              <h2 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Join a Team That Values Your Growth
              </h2>
              
              <p className={`text-lg mb-6 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Work on <strong>Fortune 500 projects</strong>, cutting-edge SaaS products, and large-scale data platforms with experienced engineers who are invested in your career development.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center flex-shrink-0">
                      <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Fast Career Growth
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Clear promotion paths, leadership opportunities, and mentorship from senior engineers
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center flex-shrink-0">
                      <Users size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Flexible & Remote-Friendly
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Work from anywhere, flexible hours, and a culture that respects work-life balance
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                to="/careers"
                variant="primary"
                size="lg"
                icon={<ArrowRight size={18} />}
                iconPosition="right"
              >
                View Open Positions
              </Button>
            </div>
            
            <div className="animate-slide-in-right">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop" 
                alt="Team Collaboration" 
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
      </Section>

      {/* Final CTA Section */}
      <Section padding="default" background="alt" isDark={isDark}>
        <div className="text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Ready to Scale Your Technology Team?
          </h2>
          <p className={`text-xl mb-10 max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Contact us to discuss your needs, challenges, and how we can help you achieve your goals faster.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button 
              to="/contact"
              size="lg"
              variant="primary"
              icon={<PhoneCall size={20} />}
              iconPosition="left"
            >
              Contact Us
            </Button>
            <Button 
              to="/services"
              size="lg"
              variant={isDark ? 'secondaryDark' : 'secondary'}
              icon={<MessageSquare size={20} />}
              iconPosition="left"
            >
              View All Services
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No obligation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Custom roadmap in 48 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Clear expectations</span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};
