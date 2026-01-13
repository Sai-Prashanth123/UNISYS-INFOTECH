import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, PieChart, LineChart } from 'lucide-react';

export const BusinessIntelligencePageNew = () => {
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

  const biServices = [
    'Data warehouse design and implementation',
    'ETL (Extract, Transform, Load) processes',
    'Interactive dashboards and reports',
    'Real-time analytics and monitoring',
    'Self-service BI solutions',
    'Data visualization and storytelling',
    'KPI tracking and performance metrics',
    'Business analytics consulting'
  ];

  const benefits = [
    'Better decision-making with real-time insights',
    'Improved operational efficiency',
    'Identify trends and opportunities',
    'Enhanced data accessibility for all teams',
    'Reduced reporting time and costs',
    'Competitive advantage through data insights'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/30 via-yellow-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(234,179,8,0.15),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
            Business Intelligence
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
                          service.name === 'Business Intelligence'
                            ? 'bg-yellow-600 text-white font-semibold'
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
                  BI(Business Intelligence) is a set of processes, architectures, and technologies that convert raw data into meaningful information that drives profitable business actions. It is a suite of software and services to transform data into actionable intelligence and knowledge.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  BI has a direct impact on organization's strategic, tactical and operational business decisions. BI supports fact-based decision making using historical data rather than assumptions and gut feeling.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  BI tools perform data analysis and create reports, summaries, dashboards, maps, graphs, and charts to provide users with detailed intelligence about the nature of the business.
                </p>
              </div>

              {/* Advantages */}
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
                  Here are some of the advantages of using Business Intelligence System:
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">1. Boost productivity</h3>
                    <p className="text-lg text-slate-300 leading-relaxed">
                      With a BI program, It is possible for businesses to create reports with a single click thus saves lots of time and resources. It also allows employees to be more productive on their tasks.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">2. To improve visibility</h3>
                    <p className="text-lg text-slate-300 leading-relaxed">
                      BI also helps to improve the visibility of these processes and make it possible to identify any areas which need attention.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">3. Fix Accountability</h3>
                    <p className="text-lg text-slate-300 leading-relaxed">
                      BI system assigns accountability in the organization as there must be someone who should own accountability and ownership for the organization's performance against its set goals.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">4. It gives a bird's eye view:</h3>
                    <p className="text-lg text-slate-300 leading-relaxed">
                      BI system also helps organizations as decision makers get an overall bird's eye view through typical BI features like dashboards and scorecards.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">5. It streamlines business processes:</h3>
                    <p className="text-lg text-slate-300 leading-relaxed">
                      BI takes out all complexity associated with business processes. It also automates analytics by offering predictive analysis, computer modeling, benchmarking and other methodologies.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">6. It allows for easy analytics.</h3>
                    <p className="text-lg text-slate-300 leading-relaxed">
                      BI software has democratized its usage, allowing even nontechnical or non-analysts users to collect and process data quickly. This also allows putting the power of analytics from the hand's many people.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center mt-12">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/50"
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
