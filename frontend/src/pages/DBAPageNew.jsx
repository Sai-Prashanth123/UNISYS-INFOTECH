import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, CheckCircle2, Server, HardDrive } from 'lucide-react';

export const DBAPageNew = () => {
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

  const dbaServices = [
    'Database design and architecture',
    'Performance tuning and optimization',
    'Backup and disaster recovery planning',
    'Database security and compliance',
    'Migration and upgrade services',
    'Monitoring and maintenance',
    'Query optimization and indexing',
    'Database replication and clustering'
  ];

  const benefits = [
    'Improved database performance and reliability',
    'Enhanced data security and compliance',
    'Reduced downtime and faster recovery',
    'Optimized storage and cost efficiency',
    'Proactive monitoring and issue prevention',
    'Expert guidance for database strategy'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 via-orange-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.15),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
            Database Administration
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
                          service.name === 'Database Administration'
                            ? 'bg-orange-600 text-white font-semibold'
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
                  A database administrator (DBA) is a person who manages, maintains, and secures data in one or more data systems so that a user can perform analysis for business operations. DBAs take care of data storage, organization, presentation, utilization, and analysis from a technical perspective.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  The DBA job is transitioning from being database-centric to data-centric, as Data Management becomes more autonomous. Augmented Data Management, machine learning (ML) and artificial intelligence(AI) make accomplishing general database upkeep easier, reducing the amount of manual labor. This, in turn, frees up the DBA to do more strategic tasks such as ensuring compliance with regulations and improving data flow performance.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Many see the DBA's responsibilities shifting from managing a few database instances and systems to managing more of them. As the number of data sources increases, DBAs will be focused on enterprise data rather than specializing in a few database technologies.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  The rate at which the DBA's role transforms will vary depending on a company's ability to embrace and implement new data technologies. Some DBAs will continue to work with a few older relational database technologies since many businesses continue to use them. However, the DBA's role will continue to evolve across most organizations. This means DBAs will be involved in more high-level data analytics and DevOps tasks.
                </p>
              </div>

              {/* CTA */}
              <div className="text-center mt-12">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/50"
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
