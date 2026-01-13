import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cloud, CheckCircle2, Server, Database } from 'lucide-react';

export const CloudServicesPageNew = () => {
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

  const cloudServices = [
    'Cloud migration and modernization',
    'Multi-cloud and hybrid cloud architecture',
    'Cloud infrastructure setup and management',
    'Cloud cost optimization',
    'Cloud security and compliance',
    'Serverless architecture implementation',
    'Cloud backup and disaster recovery',
    'Cloud monitoring and performance optimization'
  ];

  const benefits = [
    'Scalability to handle growing workloads',
    'Cost efficiency with pay-as-you-go model',
    'High availability and reliability',
    'Enhanced security and compliance',
    'Faster deployment and time to market',
    'Global reach and accessibility'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/30 via-cyan-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.15),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
            Cloud Services
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
                          service.name === 'Cloud Services'
                            ? 'bg-cyan-600 text-white font-semibold'
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
                  The cloud is a managed service, but it isn't managing itself. Elevate your cloud to new heights with services built for the complex multicloud world. Our integrated approach to cloud data management and storage helps you get the day-to-day tasks right and take charge.
                </p>
              </div>

              {/* Modernize with Cloud */}
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  Modernize with cloud
                </h2>
                <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                  cloud transformation expertise comes from running operations and processes for hundreds of large enterprises. We'll help you make the move from migration to modernization.
                </p>
                <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                  We partner with cloud leaders – including Microsoft Azure, Amazon Web Services (AWS), and Google Cloud – and software-as-a-service (SaaS) providers to develop our unique suite of cloud-based products and services. Let us help you manage cloud migration and modernization. With our cloud services, you'll find the support you need whatever your industry.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  We build our cloud solutions on a deep understanding of how the cloud can connect people, processes, technology, and data. With this approach, we'll help your business digitally transform, while keeping employees productive and customers satisfied.
                </p>
              </div>

              {/* CTA */}
              <div className="text-center mt-12">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50"
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
