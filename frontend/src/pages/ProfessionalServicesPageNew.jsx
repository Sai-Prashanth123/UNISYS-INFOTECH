import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const ProfessionalServicesPageNew = () => {
  const servicesList = [
    { name: 'Software Development', path: '/services/software-development' },
    { name: 'QA Automation', path: '/services/qa' },
    { name: 'DevOps', path: '/services/devops' },
    { name: 'Cloud Services', path: '/services/cloud-services' },
    { name: 'Database Administration', path: '/services/dba' },
    { name: 'CRM', path: '/services/crm' },
    { name: 'Data Science', path: '/services/data-science' },
    { name: 'Business Intelligence', path: '/services/business-intelligence' },
    { name: 'Professional Services', path: '/services/professional' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-purple-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.15),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
            Professional Services
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Services List */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-blue-900/30">
                <h3 className="text-xl font-bold mb-4 text-white">Our Services</h3>
                <ul className="space-y-2">
                  {servicesList.map((service, idx) => (
                    <li key={idx}>
                      <Link 
                        to={service.path}
                        className={`block py-2.5 px-4 rounded-lg transition-all duration-200 ${
                          service.name === 'Professional Services'
                            ? 'bg-purple-600 text-white font-semibold'
                            : 'text-slate-300 hover:bg-[#1a2942] hover:text-white'
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
          {/* Overview */}
          <div className="mb-12 space-y-6">
            <p className="text-lg text-slate-300 leading-relaxed">
              IT Professional Services can be defined as the delivery of technology-related services to a customer, allowing them to focus on their core business concerns. Services can range from consulting and advising on a strategy to product deployment and data analytics.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed">
              The key role of Professional Services is to take a technical solution and tailor it to ensure it works for the client in a way that meets their overall technology strategy and wider business goals.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed">
              Quite often, a business will invest in an 'out-the-box' product without the knowledge of how to use it effectively. A Professional Services team is on hand to understand the challenges faced by the business and optimise the technology to fix those problems.
            </p>
          </div>

          {/* Services Grid */}
          <div className="mb-12 grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-purple-900/30">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">E-Business Suite</h3>
              <p className="text-slate-300 leading-relaxed">
                Optimize your business with E-Business Suite to boost efficiency, cut costs, and implement industry best practises in process automation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-purple-900/30">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Cloud ERP</h3>
              <p className="text-slate-300 leading-relaxed">
                Unisys provides the full suite of Oracle Cloud Applications, including the enterprise resource planning (ERP) services of Oracle Fusion Cloud.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-purple-900/30">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Cloud HCM</h3>
              <p className="text-slate-300 leading-relaxed">
                Unisys, gives you access to Oracle's Cloud HCM services so that your HR operations can be updated and improved.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-purple-900/30">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Oracle Cloud EPM</h3>
              <p className="text-slate-300 leading-relaxed">
                Unisys delivers a cutting-edge platform and has extensive experience implementing Oracle Enterprise Management (EPM).
              </p>
            </div>
          </div>

          {/* We Work With Section */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center">
              We Work with Product Startups and Mature Product Companies
            </h2>
          </div>

          {/* Supported Oracle Applications */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">Supported Oracle applications and data solutions</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
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
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#1a2942]/30 border border-purple-900/20">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Oracle Categories */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">Supported Oracle categories</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Oracle Enterprise Resource Planning (ERP)',
                'Oracle Commerce Platform (ATG)',
                'Oracle Commerce (CX)',
                'Oracle Enterprise Performance Management (EPM)',
                'Oracle Business intelligence and Analytics',
                'Oracle Data Integration technologies',
                'Oracle Fusion Middleware'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#1a2942]/30 border border-purple-900/20">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50"
            >
              To Know More Contact Us
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};
