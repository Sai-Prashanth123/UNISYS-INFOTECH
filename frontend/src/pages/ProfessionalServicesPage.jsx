import React from 'react';
import { useThemeStore } from '../store/index.js';
import { Link } from 'react-router-dom';

export const ProfessionalServicesPage = () => {
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

  const solutions = [
    {
      title: 'E-Business Suite',
      description: 'Optimize your business with E-Business Suite to boost efficiency, cut costs, and implement industry best practices in process automation.'
    },
    {
      title: 'Cloud ERP',
      description: 'UNISYS INFOTECH provides the full suite of Oracle Cloud Applications, including the enterprise resource planning (ERP) services of Oracle Fusion Cloud.'
    },
    {
      title: 'Cloud HCM',
      description: 'UNISYS INFOTECH gives you access to Oracle\'s Cloud HCM services so that your HR operations can be updated and improved.'
    },
    {
      title: 'Oracle Cloud EPM',
      description: 'UNISYS INFOTECH delivers a cutting-edge platform and has extensive experience implementing Oracle Enterprise Performance Management (EPM).'
    }
  ];

  const oracleApplications = [
    'Oracle E-Business Suite',
    'Oracle Peoplesoft',
    'Oracle EPM (Hyperion)',
    'Oracle Business Intelligence',
    'Oracle Commerce (CX)',
    'Oracle Commerce Platform (ATG)',
    'Oracle Fusion',
    'Oracle Fusion Middleware',
    'Oracle Cloud Applications',
    'Oracle Database',
    'Oracle Autonomous Data Warehouse',
    'Oracle Analytics Cloud',
    'Governance, Risk, and Compliance (Oracle GRC)',
    'Enterprise Command Center (Oracle ECC)',
    'Discoverer',
    'Oracle Application Express (APEX)',
    'Identity Management Suite (OID/SSO)',
    'Oracle Agile'
  ];

  const oracleCategories = [
    'Oracle Enterprise Resource Planning (ERP)',
    'Oracle Commerce Platform (ATG)',
    'Oracle Commerce (CX)',
    'Oracle Enterprise Performance Management (EPM)',
    'Oracle Business Intelligence and Analytics',
    'Oracle Data Integration Technologies',
    'Oracle Fusion Middleware'
  ];

  return (
    <div className={isDark ? 'bg-slate-900 text-white' : 'bg-slate-50'}>
      {/* Hero Section */}
      <section className={`py-20 px-4 ${isDark ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-slate-100'} animate-fade-in`}>
        <div className="max-w-6xl mx-auto">
          <div className={`mb-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <Link to="/services" className="hover:underline">Services</Link> &gt; Professional Services
          </div>
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 animate-slide-up ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Professional Services
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
                          service.name === 'Professional Services' 
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
              {/* Introduction */}
              <div className="mb-12 animate-slide-up">
                <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  IT Professional Services can be defined as the delivery of technology-related services to a customer, allowing them to focus on their core business concerns. Services can range from consulting and advising on a strategy to product deployment and data analytics.
                </p>
                <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  The key role of Professional Services is to take a technical solution and tailor it to ensure it works for the client in a way that meets their overall technology strategy and wider business goals.
                </p>
                <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Quite often, a business will invest in an 'out-of-the-box' product without the knowledge of how to use it effectively. A Professional Services team is on hand to understand the challenges faced by the business and optimise the technology to fix those problems.
                </p>
              </div>

              {/* Solutions Section */}
              <div className="mb-12">
                <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-slate-900'} animate-slide-up`}>
                  Solutions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {solutions.map((solution, idx) => (
                    <div 
                      key={idx} 
                      className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-lg p-6 animate-slide-up`}
                      style={{animationDelay: `${idx * 0.1}s`}}
                    >
                      <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {solution.title}
                      </h3>
                      <p className={isDark ? 'text-gray-300' : 'text-slate-700'}>
                        {solution.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Oracle Section */}
              <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-8 mb-12 animate-fade-in`}>
                <h2 className={`text-3xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  We Work with Product Startups and Mature Product Companies
                </h2>

                {/* Supported Oracle Applications */}
                <div className="mb-8">
                  <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Supported Oracle applications and data solutions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {oracleApplications.map((app, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className={`mr-3 font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span>
                        <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>{app}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supported Oracle Categories */}
                <div>
                  <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Supported Oracle categories
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {oracleCategories.map((category, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className={`mr-3 font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span>
                        <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>{category}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
