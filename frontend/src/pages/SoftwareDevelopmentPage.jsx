import React from 'react';
import { useThemeStore } from '../store/index.js';
import { Link } from 'react-router-dom';

export const SoftwareDevelopmentPage = () => {
  const isDark = useThemeStore((state) => state.isDark);

  const servicesList = [
    { name: 'Software Development', path: '/services/software-development' },
    { name: 'DevOps', path: '/services/devops' },
    { name: 'Cloud Services', path: '/services/cloud-services' },
    { name: 'CRM', path: '/services/crm' },
    { name: 'Data Science', path: '/services/data-science' },
    { name: 'Business Intelligence', path: '/services/business-intelligence' },
    { name: 'DBA', path: '/services/dba' },
    { name: 'QA Automation', path: '/services/qa' },
    { name: 'Professional Services', path: '/services/professional' }
  ];

  const newProductDevelopment = [
    'Analyzing the context of the product use: needs and expectations of target users, estimated target market, device preference.',
    'Feature modeling including backbone and killer features to make the product marketable.',
    'Researching applicable compliance requirements.',
    'Planning product releases and prioritizing features.',
    'Architecting a product using an optimal approach.',
    'Designing UX and UI.',
    'Elaborating subscription plans (if needed).',
    'Delivering product releases according to the plan.'
  ];

  const continuousEvolution = [
    'Implementing behavior analytics to spot frictions in user journeys.',
    'Planning UX and UI improvements based on behavior analytics insights and user feedback.',
    'Delivering new functional modules and features envisaged in the product roadmap.',
    'Managing technical backlog.',
    'Developing APIs to expand your product\'s integration capabilities.',
    'Migrating the product to the cloud or changing a cloud provider.',
    'L1, L2 and L3 user and product support.'
  ];

  return (
    <div className={isDark ? 'bg-slate-900 text-white' : 'bg-slate-50'}>
      {/* Hero Section */}
      <section className={`py-20 px-4 ${isDark ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-slate-100'} animate-fade-in`}>
        <div className="max-w-6xl mx-auto">
          <div className={`mb-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <Link to="/services" className="hover:underline">Services</Link> &gt; Software Development
          </div>
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 animate-slide-up ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Software Development
          </h1>
        </div>
      </section>

      {/* Two Column Layout */}
      <section className={`py-12 px-4 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Services List */}
            <aside className="lg:col-span-1">
              <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-6 sticky top-4`}>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Services</h3>
                <ul className="space-y-2">
                  {servicesList.map((service, idx) => (
                    <li key={idx}>
                      <Link 
                        to={service.path}
                        className={`block py-2 px-3 rounded transition-colors ${
                          service.name === 'Software Development' 
                            ? (isDark ? 'bg-indigo-600 text-white font-semibold' : 'bg-indigo-600 text-white font-semibold')
                            : (isDark ? 'text-gray-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-200')
                        }`}
                      >
                        {service.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              <div className="mb-12 animate-slide-up">
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Software Development
                </h2>
                <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Software Development services is your possibility to outsource software engineering and support, and get maintainable, secure and impactful software at the best price.
                </p>
                <p className={`text-lg leading-relaxed mb-8 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Software product development helps create marketable commercial software for business users or individual consumers. UNISYS INFOTECH provides outsourced product development services to design, architect and implement user-friendly and engaging software products.
                </p>
                <h3 className={`text-2xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  We Work with Product Startups and Mature Product Companies
                </h3>
                <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-8 mb-8 animate-fade-in`}>
                  <h4 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    New product development
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Analyzing the context of the product use: needs and expectations of target users, estimated target market, device preference.</span></li>
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Feature modeling including backbone and killer features to make the product marketable.</span></li>
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Researching applicable compliance requirements.</span></li>
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Planning product releases and prioritizing features.</span></li>
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Architecting a product using an optimal approach.</span></li>
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Designing UX and UI.</span></li>
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Elaborating subscription plans (if needed).</span></li>
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Delivering product releases according to the plan.</span></li>
                  </ul>
                </div>
                <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-8 mb-8 animate-fade-in`}>
                  <h4 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Continuous product evolution
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Implementing behavior analytics to spot frictions in user journeys.</span></li>
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Planning UX and UI improvements based on behavior analytics insights and user feedback.</span></li>
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Delivering new functional modules and features envisaged in the product roadmap.</span></li>
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Managing technical backlog.</span></li>
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Developing APIs to expand your product’s integration capabilities.</span></li>
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Migrating the product to the cloud or changing a cloud provider.</span></li>
                    <li className="flex items-start"><span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span><span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>L1, L2 and L3 user and product support.</span></li>
                  </ul>
                </div>
                <div className="text-center">
                  <Link 
                    to="/contact"
                    className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg"
                  >
                    To Know More Contact Us
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};
