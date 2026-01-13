import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, CheckCircle2, Zap, Users, Target } from 'lucide-react';

export const SoftwareDevelopmentPageNew = () => {
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
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-blue-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
            Software Development
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
                          service.name === 'Software Development'
                            ? 'bg-blue-600 text-white font-semibold'
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
              <div className="mb-12">
                <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                  Software Development services is your possibility to outsource software engineering and support, and get maintainable, secure and impactful software at the best price.
                </p>
                <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                  Software product development helps create marketable commercial software for business users or individual consumers. UNISYS INFOTECH provides outsourced product development services to design, architect and implement user-friendly and engaging software products.
                </p>
              </div>

              {/* We Work With Section */}
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center">
                  We Work with Product Startups and Mature Product Companies
                </h2>
              </div>

              {/* New Product Development */}
              <div className="mb-12">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-blue-900/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      New Product Development
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {newProductDevelopment.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                        <span className="text-slate-300 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Continuous Product Evolution */}
              <div className="mb-12">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-blue-900/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      Continuous Product Evolution
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {continuousEvolution.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                        <span className="text-slate-300 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50"
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
