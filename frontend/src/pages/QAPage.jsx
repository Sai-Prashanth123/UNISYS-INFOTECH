import React from 'react';
import { useThemeStore } from '../store/index.js';
import { Link } from 'react-router-dom';

export const QAPage = () => {
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
            <Link to="/services" className="hover:underline">Services</Link> &gt; QA Automation
          </div>
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 animate-slide-up ${isDark ? 'text-white' : 'text-slate-900'}`}>
            QA Automation
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
                          service.name === 'QA Automation' 
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
                  QA Automation
                </h2>
                
                <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  We Deliver Automation Testing Services that Guarantee Quality & ROI
                </h3>

                <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Despite the countless benefits of Automation testing, it is not easy to achieve. You'll have to choose the right tools, build automation test suites, and need a team of scripting experts to overcome the challenges. Or you could ease everything with Codiod on your team.
                </p>

                <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Being an experienced automation testing company with a capable team, our test automation scripts are Free from Flaky Tests and ensure Zero Defect Spill Rate. Here are a few highlights from our Decade Long Journey.
                </p>

                <p className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Software quality assurance is one of the most important processes in the software industry and any company developing an application or an end-to-end system knows its importance. It is quite common for many companies to outsource the QA part of the software cycle. However, not all software performance testing services are created equal.
                </p>

                <p className={`text-lg leading-relaxed mb-8 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Today, automated testing services are all the rage in the industry and for good reason. Manual testing still has its place in certain scenarios. However, it is no exaggeration to say that the days of doing software quality testing manually using a big team of quality testers is certainly on its way out.
                </p>
              </div>

              {/* Quality Assurance Section */}
              <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-8 mb-12 animate-fade-in`}>
                <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Quality Assurance
                </h3>
                
                <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Software quality assurance is one of the most important processes in the software industry and any company developing an application or an end-to-end system knows its importance. It is quite common for many companies to outsource the QA part of the software cycle. However, not all software performance testing services are created equal.
                </p>

                <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Today, automated testing services are all the rage in the industry and for good reason. Manual testing still has its place in certain scenarios. However, it is no exaggeration to say that the days of doing software quality testing manually using a big team of quality testers is certainly on its way out.
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
