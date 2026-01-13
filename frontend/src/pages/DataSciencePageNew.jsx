import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, CheckCircle2, TrendingUp, Zap } from 'lucide-react';

export const DataSciencePageNew = () => {
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

  const dataServices = [
    'Machine learning model development',
    'Predictive analytics and forecasting',
    'Natural language processing (NLP)',
    'Computer vision and image recognition',
    'Data mining and pattern recognition',
    'Statistical analysis and modeling',
    'Big data processing and analysis',
    'AI/ML model deployment and monitoring'
  ];

  const benefits = [
    'Data-driven decision making',
    'Predictive insights for business growth',
    'Automated processes and efficiency',
    'Competitive advantage through AI',
    'Better customer understanding',
    'Risk mitigation and fraud detection'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-indigo-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
            Data Science
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
                          service.name === 'Data Science'
                            ? 'bg-indigo-600 text-white font-semibold'
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
                  Build expertise in data manipulation, visualization, predictive analytics, machine learning, and data science. With the skills you learn in a Nanodegree program, you can launch or advance a successful data career.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Start acquiring valuable skills right away, create a project portfolio to demonstrate your abilities, and get support from mentors, peers, and experts in the field. We offer five unique programs to support your career goals in the data science field.
                </p>
              </div>

              {/* CTA */}
              <div className="text-center mt-12">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50"
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
