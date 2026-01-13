import React from 'react';
import { useThemeStore } from '../store/index.js';
import { Link } from 'react-router-dom';

export const CloudServicesPage = () => {
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

  return (
    <div className={isDark ? 'bg-slate-900 text-white' : 'bg-slate-50'}>
      {/* Hero Section */}
      <section className={`py-20 px-4 ${isDark ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-slate-100'} animate-fade-in`}>
        <div className="max-w-6xl mx-auto">
          <div className={`mb-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <Link to="/services" className="hover:underline">Services</Link> &gt; Cloud Services
          </div>
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 animate-slide-up ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Cloud Services
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
                          service.name === 'Cloud Services' 
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
                  Cloud Services
                </h2>
                
                <p className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  The cloud is a managed service, but it isn't managing itself. Elevate your cloud to new heights with services built for the complex multicloud world. Our integrated approach to cloud data management and storage helps you get the day-to-day tasks right and take charge.
                </p>

                <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Modernize with cloud
                </h3>

                <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  cloud transformation expertise comes from running operations and processes for hundreds of large enterprises. We'll help you make the move from migration to modernization.
                </p>

                <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  We partner with cloud leaders - including Microsoft Azure, Amazon Web Services (AWS), and Google Cloud - and software-as-a-service (SaaS) providers to develop our unique suite of cloud-based products and services. Let us help you manage cloud migration and modernization. With our cloud services, you'll find the support you need whatever your industry.
                </p>

                <p className={`text-lg leading-relaxed mb-8 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  We build our cloud solutions on a deep understanding of how the cloud can connect people, processes, technology, and data. With this approach, we'll help your business digitally transform, while keeping employees productive and customers satisfied.
                </p>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Link 
                  to="/contact"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg"
                >
                  To Know More Contact Us
                </Link>
              </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};
