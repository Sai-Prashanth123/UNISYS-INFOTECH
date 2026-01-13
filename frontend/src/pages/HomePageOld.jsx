import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/index.js';
import { Code, Cloud, Database, CheckSquare, Briefcase, Users, ArrowRight } from 'lucide-react';

export const HomePage = () => {
  const isDark = useThemeStore((state) => state.isDark);

  const keyServices = [
    {
      title: 'CRM',
      icon: Users,
      desc: 'CRM (Customer Relationship Management) software helps you track every interaction with prospects and customers in one place so your teams can sell, support, and market more effectively.'
    },
    {
      title: 'Data Science',
      icon: Database,
      desc: 'Our data science services cover data engineering, visualization, predictive analytics, and machine learning to turn your raw data into practical insights and better business decisions.'
    },
    {
      title: 'DevOps',
      icon: Cloud,
      desc: 'DevOps services align development and IT operations through automation, CI/CD pipelines, and modern tooling so you can ship features faster with fewer incidents.'
    }
  ];

  const detailedServices = [
    {
      title: 'Software Development',
      desc: 'We design and build secure, maintainable web and enterprise applications tailored to your domain, using modern architectures and proven engineering practices.\n\nFrom discovery to deployment and support, our teams act as an extension of your organisation to deliver reliable software on time and within budget.',
      icon: Code
    },
    {
      title: 'QA Automation',
      desc: 'Our QA automation practice designs robust test frameworks that increase coverage, reduce regression time, and improve release quality.\n\nYou get the right tools, scripts, and reporting in place so your teams can release confidently and focus on new features instead of repetitive manual testing.',
      icon: CheckSquare
    },
    {
      title: 'DevOps',
      desc: 'UNISYS INFOTECH implements CI/CD pipelines, Infrastructure as Code, observability, and release automation so your teams can collaborate across the entire application lifecycle.\n\nWe help break down silos between development and operations to improve deployment frequency, reliability, and time‑to‑market.',
      icon: Cloud
    },
    {
      title: 'Cloud Services',
      desc: 'Our cloud services help you migrate, optimize, and manage workloads across public and hybrid clouds with a focus on performance, security, and cost control.\n\nWe design cloud architectures, implement backup and disaster recovery, and provide ongoing monitoring so your environment stays healthy.',
      icon: Cloud
    },
    {
      title: 'Database Administrator',
      desc: 'Our DBA services cover design, implementation, performance tuning, backup, and security for your critical data platforms.\n\nWe ensure your data is stored, organized, and delivered reliably so business users and analytics teams can access what they need, when they need it.',
      icon: Database
    },
    {
      title: 'IT Consulting',
      desc: 'Expert guidance for digital transformation including technology strategy, architecture design, and process optimization.',
      icon: Briefcase
    }
  ];

  return (
    <div className="bg-gradient-to-b from-secondary to-primary/5 text-textPrimary">
      {/* Hero Section - Professional Light Design */}
      <section className="min-h-screen flex items-center justify-between bg-gradient-to-br from-secondary via-primary/5 to-accent/10 px-4 py-20 relative overflow-hidden">
        {/* Background visualization */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-20 w-72 h-72 bg-primary rounded-full blur-2xl"></div>
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'linear-gradient(45deg, #00BCD4 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-slide-in-left">
              {/* Product Badge */}
              <div className="inline-block mb-6 animate-fade-in">
                <div className="border border-accent/50 bg-accent/10 px-4 py-2 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-accent font-semibold text-sm">US-Based IT Solutions</span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight animate-slide-up text-primary" style={{animationDelay: '0.1s'}}>
                Future‑Ready IT Solutions for Growing Businesses
              </h1>
              
              {/* Subheading */}
              <p className="text-lg md:text-xl leading-relaxed mb-8 text-textSecondary animate-slide-up max-w-2xl" style={{animationDelay: '0.2s'}}>
                Outsource your software development, cloud, DevOps and data initiatives to a seasoned US‑based team that delivers secure, scalable and business‑driven solutions.
              </p>

              {/* Key Proof Bullets */}
              <div className="space-y-3 mb-10 animate-slide-up" style={{animationDelay: '0.25s'}}>
                <div className="flex items-start gap-3">
                  <span className="text-accent text-xl mt-1">✓</span>
                  <span className="text-textPrimary">10+ years combined experience across software, cloud and data projects for US clients</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent text-xl mt-1">✓</span>
                  <span className="text-textPrimary">Specialized team across Software Development, DevOps, Cloud, Data, QA and CRM</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent text-xl mt-1">✓</span>
                  <span className="text-textPrimary">US‑based entity: Cornelius, North Carolina office</span>
                </div>
              </div>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{animationDelay: '0.3s'}}>
                <button className="px-8 py-4 bg-accent text-secondary font-bold rounded-lg hover:shadow-2xl hover:shadow-accent/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                  Book a Free 30‑Minute Strategy Call <ArrowRight size={20} />
                </button>
                <button className="px-8 py-4 border-2 border-accent text-accent font-bold rounded-lg hover:bg-accent/10 transition-all duration-300 flex items-center justify-center gap-2">
                  Get a Custom IT Proposal
                </button>
              </div>

              {/* Assessment Line */}
              <p className="text-textSecondary text-sm mt-6 animate-slide-up" style={{animationDelay: '0.35s'}}>
                No obligation – we assess your current stack and suggest a roadmap in 48 hours.
              </p>
            </div>

            {/* Right Side - Tech Visualization */}
            <div className="hidden lg:flex items-center justify-end animate-slide-in-right relative" style={{animationDelay: '0.2s'}}>
              <div className="relative w-full h-96 flex items-center justify-center">
                {/* Center node */}
                <div className="absolute w-20 h-20 rounded-full border-2 border-accent/50 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center">
                    <Code size={24} className="text-secondary" />
                  </div>
                </div>

                {/* Orbiting nodes */}
                {[
                  {pos: 'top-0 right-1/4', delay: 0, icon: '🔐'},
                  {pos: 'top-12 right-0', delay: 1, icon: '☁️'},
                  {pos: 'bottom-12 right-0', delay: 2, icon: '📊'},
                  {pos: 'bottom-0 right-1/4', delay: 3, icon: '⚙️'},
                  {pos: 'bottom-12 right-1/2', delay: 4, icon: '🚀'},
                ].map((node, idx) => (
                  <div 
                    key={idx} 
                    className={`absolute w-16 h-16 rounded-lg border border-accent/30 bg-primary/10 backdrop-blur-sm flex items-center justify-center text-2xl ${node.pos} animate-float`}
                    style={{animationDelay: `${node.delay * 0.2}s`}}
                  >
                    {node.icon}
                  </div>
                ))}

                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                  <line x1="50%" y1="50%" x2="60%" y2="20%" stroke="#00BCD4" strokeWidth="1" />
                  <line x1="50%" y1="50%" x2="95%" y2="35%" stroke="#00BCD4" strokeWidth="1" />
                  <line x1="50%" y1="50%" x2="95%" y2="65%" stroke="#00BCD4" strokeWidth="1" />
                  <line x1="50%" y1="50%" x2="60%" y2="95%" stroke="#00BCD4" strokeWidth="1" />
                  <line x1="50%" y1="50%" x2="35%" y2="80%" stroke="#00BCD4" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Impact Statement - REMOVED - Will add Who This Is For instead */}
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-y border-borderLight">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm font-semibold mb-8 text-textSecondary tracking-wide">
            TRUSTED BY TEAMS ACROSS THE US
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="px-6 py-3 rounded-lg bg-primary/5 border border-borderLight text-sm font-medium text-textSecondary">
                Enterprise Client {idx}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For Section */}
      <section className="py-20 px-4 bg-secondary animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold mb-8 text-primary animate-slide-up">
              Who This Is For
            </h2>
            <p className="text-lg text-textSecondary mb-10 animate-slide-up" style={{animationDelay: '0.1s'}}>
              UNISYS INFOTECH is the right partner if you are:
            </p>
            
            <div className="space-y-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
              {[
                {
                  title: 'Growing SaaS or Product Company',
                  desc: 'Needing additional engineering capacity to scale without the overhead of hiring and onboarding full-time staff.'
                },
                {
                  title: 'Enterprise Looking to Modernize',
                  desc: 'Seeking to modernize applications, move to cloud or adopt DevOps to stay competitive and improve operational efficiency.'
                },
                {
                  title: 'Business Needing Reliable IT Outsourcing',
                  desc: 'That needs dependable long-term IT outsourcing instead of ad-hoc freelancers or inconsistent vendor relationships.'
                }
              ].map((item, idx) => (
                <div key={idx} className="glass-effect rounded-2xl p-6 backdrop-blur-2xl border border-accent/30 hover:border-accent/50 transition-all duration-300 animate-scale-in" style={{animationDelay: `${idx * 0.1}s`}}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-secondary font-bold text-lg">{idx + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">{item.title}</h3>
                      <p className="text-textSecondary leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className={`py-12 px-4 ${isDark ? 'bg-slate-800/50' : 'bg-slate-800/50'} border-y ${isDark ? 'border-slate-700' : 'border-slate-700'}`}>
        <div className="max-w-6xl mx-auto">
          <p className={`text-center text-sm font-semibold mb-8 text-slate-400 tracking-wide`}>
            TRUSTED BY TEAMS ACROSS THE US
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className={`px-6 py-3 rounded-lg bg-slate-700/30 text-sm font-medium text-slate-400`}>
                Enterprise Client {idx}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Services Boxes Section */}
      <section className={`py-20 px-4 ${isDark ? 'bg-slate-900' : 'bg-slate-900'} animate-fade-in`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center animate-slide-up text-secondary">
            Our Key Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {keyServices.map((service, idx) => {
              const IconComponent = service.icon;
              return (
                <div key={idx} className={`glass-effect-dark rounded-2xl p-8 animate-slide-up backdrop-blur-2xl border border-secondary/20 hover:border-accent/50 transition-all duration-300`} style={{animationDelay: `${idx * 0.1}s`}}>
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-accent to-secondary flex items-center justify-center mb-4">
                    <IconComponent size={28} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{service.title}</h3>
                  <p className='text-slate-300 leading-relaxed'>
                    {service.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className={`py-20 px-4 ${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-800' : 'bg-gradient-to-b from-slate-50 to-blue-50'} animate-fade-in`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className={`${isDark ? 'glass-effect-dark' : 'glass-effect'} p-8 rounded-2xl animate-slide-in-left`}>
              <h2 className="text-4xl font-bold mb-6 text-secondary">About Us</h2>
              <p className={`text-lg mb-4 leading-relaxed ${isDark ? 'text-white' : 'text-slate-700'}`}>
                Our experienced and professional team works with you to design the right strategic technology solutions for your business, from software product development to data and cloud services.
              </p>
              <p className={`text-lg mb-4 leading-relaxed ${isDark ? 'text-white' : 'text-slate-700'}`}>
                We provide a comprehensive range of IT outsourcing services, including application development, infrastructure management, and ongoing software support and maintenance.
              </p>
              <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-white' : 'text-slate-700'}`}>
                As we have grown, our focus has remained the same: doing what is best for our employees and customers, and making a measurable impact on every project we deliver.
              </p>
              <Link to="/about" className="btn-primary inline-flex items-center gap-2">Learn more about us <ArrowRight size={18} /></Link>
            </div>
            <div className="animate-slide-in-right">
              <div className={`${isDark ? 'glass-effect-dark' : 'glass-effect'} p-2 rounded-2xl`}>
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop" alt="Our Team" className="h-96 rounded-xl object-cover shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Best Services Section */}
      <section className={`py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800 animate-fade-in`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-white animate-fade-in">Our Best Services</h2>
          <p className="text-center text-slate-400 mb-12 text-lg max-w-2xl mx-auto">
            Comprehensive solutions designed to accelerate your digital transformation and drive measurable business results.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {detailedServices.map((service, idx) => {
              const ServiceIcon = service.icon;
              return (
                <div key={idx} className={`glass-effect-dark rounded-2xl p-8 animate-slide-up flex flex-col backdrop-blur-2xl border border-secondary/20 hover:border-accent/50 group transition-all duration-300`} style={{animationDelay: `${idx * 0.05}s`}}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-accent to-secondary group-hover:shadow-lg group-hover:shadow-accent/50 transition-all">
                      <ServiceIcon size={24} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">{service.title}</h3>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed flex-1">
                    {service.desc.split('\n\n').map((para, pidx) => (
                      <React.Fragment key={pidx}>
                        {para}
                        {pidx < service.desc.split('\n\n').length - 1 && (<><br /><br /></>)}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-800 to-slate-900 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <div className="glass-effect-dark p-2 rounded-2xl backdrop-blur-2xl">
                <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop" alt="Strategic Solutions" className="h-96 rounded-xl object-cover shadow-lg" />
              </div>
            </div>
            <div className="glass-effect-dark p-8 rounded-2xl animate-slide-in-right backdrop-blur-2xl border border-secondary/20">
              <h2 className="text-4xl font-bold mb-6 text-white">Why Choose Us</h2>
              <div className="space-y-5">
                <p className="text-lg leading-relaxed text-slate-200">
                  ✓ Deep technical expertise combined with clear business acumen
                </p>
                <p className="text-lg leading-relaxed text-slate-200">
                  ✓ Outcome-driven services with stable, dedicated teams
                </p>
                <p className="text-lg leading-relaxed text-slate-200">
                  ✓ Proven track record delivering secure, scalable solutions
                </p>
                <p className="text-lg leading-relaxed text-slate-200">
                  ✓ Long-term partnership approach aligned with your growth
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Build Your Career Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="glass-effect-dark p-8 rounded-2xl animate-slide-in-left backdrop-blur-2xl border border-secondary/20">
              <h2 className="text-4xl font-bold mb-4 text-white">Build Your Career</h2>
              <p className="text-xl mb-6 font-semibold text-accent">With UNISYS INFOTECH</p>
              <div className="space-y-4 mb-8">
                <p className="text-lg leading-relaxed text-slate-200">
                  Join our talented team of engineers, data scientists, and DevOps specialists who are passionate about building world-class solutions.
                </p>
                <p className="text-lg leading-relaxed text-slate-200">
                  We offer competitive compensation, professional development, work-life balance, and a collaborative culture where your contributions matter.
                </p>
                <p className="text-lg leading-relaxed text-slate-200">
                  If you're committed to excellence and continuous growth, we'd love to hear from you.
                </p>
              </div>
              <Link to="/careers" className="btn-primary inline-flex items-center gap-2">View open positions <ArrowRight size={18} /></Link>
            </div>
            <div className="animate-slide-in-right">
              <div className="glass-effect-dark p-2 rounded-2xl backdrop-blur-2xl">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop" alt="Team Culture" className="h-96 rounded-xl object-cover shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Clients Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-800 to-slate-900 animate-fade-in">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white animate-fade-in">
            Trusted By Enterprise<br/>
            <span className="bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent">Teams Across the US</span>
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed text-slate-300 animate-slide-up">
            We partner with enterprises and fast‑growing companies across multiple industries, delivering reliable technology solutions that support their critical operations and drive measurable business impact.
          </p>
        </div>
      </section>
    </div>
  );
};
