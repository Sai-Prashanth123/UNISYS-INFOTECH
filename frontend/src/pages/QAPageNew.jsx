import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, CheckCircle2, Bug, TestTube } from 'lucide-react';

export const QAPageNew = () => {
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

  const qaServices = [
    'Automated testing framework development',
    'Test strategy and planning',
    'Functional and regression testing',
    'Performance and load testing',
    'Security testing and vulnerability assessment',
    'API and integration testing',
    'Mobile application testing',
    'Continuous testing in CI/CD pipelines'
  ];

  const benefits = [
    'Faster release cycles with automated testing',
    'Improved software quality and reliability',
    'Early bug detection and resolution',
    'Reduced testing costs and manual effort',
    'Comprehensive test coverage',
    'Better user experience and satisfaction'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/30 via-green-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.15),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
            QA Automation
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
                          service.name === 'QA Automation'
                            ? 'bg-green-600 text-white font-semibold'
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
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  We Deliver Automation Testing Services that Guarantee Quality & ROI
                </h2>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Despite the countless benefits of Automation testing, it is not easy to achieve. You'll have to choose the right tools, build automation test suites, and need a team of scripting experts to overcome the challenges. Or you could ease everything with Codoid on your team.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Being an experienced automation testing company with a capable team, our test automation scripts are Free from Flaky Tests and ensure Zero Defect Spill Rate. Here are a few highlights from our Decade Long Journey.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Software quality assurance is one of the most important processes in the software industry and any company developing an application or an end-to-end system knows its importance. It is quite common for many companies to outsource the QA part of the software cycle. However, not all software performance testing services are created equal.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Today, automated testing services are all the rage in the industry and for good reason. Manual testing still has its place in certain scenarios. However, it is no exaggeration to say that the days of doing software quality testing manually using a big team of quality testers is certainly on its way out.
                </p>
              </div>

              {/* Quality Assurance Section */}
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  Quality Assurance
                </h2>
                <div className="space-y-6">
                  <p className="text-lg text-slate-300 leading-relaxed">
                    Software quality assurance is one of the most important processes in the software industry and any company developing an application or an end-to-end system knows its importance. It is quite common for many companies to outsource the QA part of the software cycle. However, not all software performance testing services are created equal.
                  </p>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    Today, automated testing services are all the rage in the industry and for good reason. Manual testing still has its place in certain scenarios. However, it is no exaggeration to say that the days of doing software quality testing manually using a big team of quality testers is certainly on its way out.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center mt-12">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50"
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
