import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, CheckCircle2, Users, TrendingUp } from 'lucide-react';

export const CRMPageNew = () => {
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

  const crmServices = [
    'CRM system implementation and customization',
    'Customer data management and integration',
    'Sales pipeline automation',
    'Marketing automation and campaign management',
    'Customer support and service management',
    'Analytics and reporting dashboards',
    'Mobile CRM solutions',
    'CRM migration and data transfer'
  ];

  const benefits = [
    'Improved customer relationships and retention',
    'Streamlined sales and marketing processes',
    'Better customer insights and analytics',
    'Increased sales productivity and efficiency',
    'Enhanced customer service and support',
    'Data-driven decision making'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/30 via-pink-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.15),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
            CRM
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
                          service.name === 'CRM'
                            ? 'bg-pink-600 text-white font-semibold'
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
                  CRM (customer relationship management) software tracks and manages customer relationships. It records interactions between a business, its prospects, and its existing customers. CRM software products place all relevant customer data like contact information, history, and transaction summaries into a concise live record.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  A better way to manage your sales, projects, team, clients & marketing - on a single platform. Powerful, affordable & easy to use software for your business.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Customer relationship management software is most commonly used in sales departments to act as a central hub for salesforce automation (SFA). It is often integrated with e-commerce platforms, marketing automation software, customer service software, and other business applications to facilitate an enhanced and coordinated customer experience.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Some CRM solutions provide a collection of integrated customer-related functions, or all-in-one functionality, such as marketing automation, email marketing, e-commerce tools, or website management, to replace the need for additional solutions and better serve small and mid-market businesses. Standalone CRM solutions, however, focus primarily on sales-related functions such as contact, account, and pipeline management.
                </p>
              </div>

              {/* Qualification Criteria */}
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  To qualify for inclusion in the CRM category, a product must
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />
                    <span className="text-lg text-slate-300 leading-relaxed">Provide a bounded set of sales-related functions.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />
                    <span className="text-lg text-slate-300 leading-relaxed">Consolidate customer history and transactions into a single interface.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />
                    <span className="text-lg text-slate-300 leading-relaxed">Track prospects and contacts throughout the sales pipeline.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />
                    <span className="text-lg text-slate-300 leading-relaxed">Facilitate communication at all phases of the customer lifecycle.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />
                    <span className="text-lg text-slate-300 leading-relaxed">Integrate functions into a unifying database and platform.</span>
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <div className="text-center mt-12">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-pink-600 hover:bg-pink-700 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/50"
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
