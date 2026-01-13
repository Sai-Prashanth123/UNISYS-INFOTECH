import React from 'react';
import { useThemeStore } from '../store/index.js';
import { Link } from 'react-router-dom';

export const DevOpsPage = () => {
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
            <Link to="/services" className="hover:underline">Services</Link> &gt; DevOps
          </div>
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 animate-slide-up ${isDark ? 'text-white' : 'text-slate-900'}`}>
            DevOps
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
                          service.name === 'DevOps' 
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
                  DevOps
                </h2>
                
                <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  DevOps is a set of practices, tools, and a cultural philosophy that automate and integrate the processes between software development and IT teams. It emphasizes team empowerment, cross-team communication and collaboration, and technology automation.
                </p>

                <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Under a DevOps model, development and operations teams are no longer "siloed." Sometimes, these two teams merge into a single team where the engineers work across the entire application lifecycle - from development and test to deployment and operations - and have a range of multidisciplinary skills.
                </p>

                <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  DevOps teams use tools to automate and accelerate processes, which helps to increase reliability. A DevOps toolchain helps teams tackle important DevOps fundamentals including continuous integration, continuous delivery, automation, and collaboration.
                </p>

                <p className={`text-lg leading-relaxed mb-8 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  DevOps values are sometimes applied to teams other than development. When security teams adopt a DevOps approach, security is an active and integrated part of the development process. This is called DevSecOps.
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
