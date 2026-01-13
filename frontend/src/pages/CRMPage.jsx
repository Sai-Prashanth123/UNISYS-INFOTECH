import React from 'react';
import { useThemeStore } from '../store/index.js';
import { Link } from 'react-router-dom';

export const CRMPage = () => {
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

  const qualifications = [
    'Provide a bounded set of sales-related functions.',
    'Consolidate customer history and transactions into a single interface.',
    'Track prospects and contacts throughout the sales pipeline.',
    'Facilitate communication at all phases of the customer lifecycle.',
    'Integrate functions into a unifying database and platform.'
  ];

  return (
    <div className={isDark ? 'bg-slate-900 text-white' : 'bg-slate-50'}>
      {/* Hero Section */}
      <section className={`py-20 px-4 ${isDark ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-slate-100'} animate-fade-in`}>
        <div className="max-w-6xl mx-auto">
          <div className={`mb-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <Link to="/services" className="hover:underline">Services</Link> &gt; CRM
          </div>
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 animate-slide-up ${isDark ? 'text-white' : 'text-slate-900'}`}>
            CRM
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
                          service.name === 'CRM' 
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
                  CRM
                </h2>
                
                <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  CRM (customer relationship management) software tracks and manages customer relationships. It records interactions between a business, its prospects, and its existing customers. CRM software products place all relevant customer data like contact information, history, and transaction summaries into a concise live record.
                </p>

                <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  A better way to manage your sales, projects, team, clients & marketing - on a single platform. Powerful, affordable & easy to use software for your business.
                </p>

                <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Customer relationship management software is most commonly used in sales departments to act as a central hub for salesforce automation (SFA). It is often integrated with e-commerce platforms, marketing automation software, customer service software, and other business applications to facilitate an enhanced and coordinated customer experience.
                </p>

                <p className={`text-lg leading-relaxed mb-8 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Some CRM solutions provide a collection of integrated customer-related functions, or all-in-one functionality, such as marketing automation, email marketing, e-commerce tools, or website management, to replace the need for additional solutions and better serve small and mid-market businesses. Standalone CRM solutions, however, focus primarily on sales-related functions such as contact, account, and pipeline management.
                </p>
              </div>

              {/* Qualifications Section */}
              <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-8 mb-12 animate-fade-in`}>
                <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  To qualify for inclusion in the CRM category, a product must
                </h3>
                
                <ul className="space-y-4">
                  {qualifications.map((qualification, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className={`mr-3 font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>✓</span>
                      <span className={`text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                        {qualification}
                      </span>
                    </li>
                  ))}
                </ul>
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
