import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/index.js';
import { Code, Zap, Users, Shield, Target, Award, Clock, TrendingUp, Globe, Mail, Phone, CheckCircle2, Briefcase, Database } from 'lucide-react';

export const AboutPage = () => {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <div className={isDark ? 'bg-slate-900 text-white' : 'bg-slate-50'}>
      {/* Hero Section */}
      <section className={`relative py-24 px-4 overflow-hidden min-h-[500px] flex items-center`}>
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/unysisinotechoffice.png')`,
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className={`absolute inset-0 ${isDark ? 'bg-slate-900/90' : 'bg-slate-900/80'}`}></div>
        </div>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10 z-[1]">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-block mb-6 px-6 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-sm">
            <span className="text-indigo-400 font-semibold">About UNISYS INFOTECH</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white animate-slide-up">
            About Us
          </h1>
        </div>
      </section>


      {/* Our Story */}
      <section className={`py-24 px-4 ${isDark ? 'bg-slate-900' : 'bg-white'} animate-fade-in`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
              UNISYS INFOTECH's Story
            </h2>
          </div>
          
          <div className={`${isDark ? 'glass-dark backdrop-blur-2xl bg-slate-800/30 border-slate-700/50' : 'glass backdrop-blur-2xl bg-white/40 border-white/60'} p-10 rounded-2xl shadow-xl space-y-6`}>
            <p className={`text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Our experienced and professional team are able to help you find the right strategic solution for your business including: reshaping hierarchies, company audits, marketing, and helping you to identify ways of streamlining workflow processes.
            </p>
            <p className={`text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Our comprehensive range of services means you can rely on and trust us to deliver a suite of effective solutions for your organisation. IT outsourcing services include application development, infrastructure and software support and maintenance.
            </p>
            <p className={`text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              When we started building software products and data services, doing what's best for our employees and customers was second nature. As we've grown to a successful and strong company, we are thankful that we have the opportunity make an even bigger impact on our customers.
            </p>
            <p className={`text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              It's our privilege to forge meaningful, long-term relationship with the customers, partners and non-profit organizations that shape our vision and values. These relationships make us who we are – a united, engaged workforce that is dedicated to being a positive presence around the globe.
            </p>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className={`py-24 px-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-4xl md:text-5xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Our Services
          </h2>
          <p className={`text-lg mb-6 leading-relaxed text-center max-w-4xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            UNISYS INFOTECH brings a wide array of IT and business consulting skills and a long history of experience across many industries that allows us to expertly tailor our services and solutions to match your business or organizational needs.
          </p>
          <p className={`text-lg mb-8 font-semibold text-center ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            On Time. On Budget. Exceeding Expectations.
          </p>
          
          <div className="text-center mb-10">
            <Link 
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              To Know More Contact Us
            </Link>
          </div>

          <h3 className={`text-3xl md:text-4xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
            What We Do
          </h3>
          <p className={`text-lg mb-10 text-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            We help organizations build, modernize, and scale their technology ecosystem through a comprehensive range of IT services, including:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Code, title: 'Software Development', desc: 'Custom web, mobile, and enterprise applications' },
              { icon: Globe, title: 'Cloud Services', desc: 'AWS, Azure, and Google Cloud migration and optimization' },
              { icon: Zap, title: 'DevOps & CI/CD', desc: 'Automation, infrastructure as code, and release acceleration' },
              { icon: Database, title: 'Database & DBA Services', desc: 'Oracle, SQL Server, MySQL, PostgreSQL support' },
              { icon: CheckCircle2, title: 'Quality Assurance & Automation', desc: 'Reliable, scalable testing frameworks' },
              { icon: TrendingUp, title: 'Business Intelligence & Data', desc: 'Dashboards, analytics, and insights' },
              { icon: Briefcase, title: 'Professional Services', desc: 'Oracle ERP, E-Business Suite, Cloud ERP & HCM' }
            ].map((service, idx) => (
              <div 
                key={idx}
                className={`${isDark ? 'glass-dark backdrop-blur-2xl bg-slate-900/40 border-slate-700/50' : 'glass backdrop-blur-2xl bg-white/50 border-white/70'} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {service.title}
                    </h3>
                    <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {service.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 px-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Build With Us
          </h2>
          <p className={`text-xl mb-10 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Whether you're modernizing legacy systems, scaling a SaaS platform, or looking for a reliable long-term engineering partner - UNISYS INFOTECH is ready to help.
          </p>
          <p className={`text-2xl font-semibold mb-10 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Let's build technology that moves your business forward.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact Us
            </Link>
            <a 
              href="mailto:info@unisysinfotech.com"
              className={`inline-flex items-center justify-center px-8 py-4 rounded-xl ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} font-semibold transition-all duration-300 hover:scale-105`}
            >
              <Mail className="w-5 h-5 mr-2" />
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
