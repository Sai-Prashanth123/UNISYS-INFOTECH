import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';

export const AboutPageNew = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-blue-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">About Us</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
            About Us
          </h1>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-400">
                UNISYS INFOTECH's Story
              </h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  Our experienced and professional team are able to help you find the right strategic solution for your business including: reshaping hierarchies, company audits, marketing, and helping you to identify ways of streamlining workflow processes.
                </p>
                <p>
                  Our comprehensive range of services means you can rely on and trust us to deliver a suite of effective solutions for your organisation. IT outsourcing services include application development, infrastructure and software support and maintenance.
                </p>
                <p>
                  When we started building software products and data services, doing what's best for our employees and customers was second nature. As we've grown to a successful and strong company, we are thankful that we have the opportunity make an even bigger impact on our customers.
                </p>
                <p>
                  It's our privilege to forge meaningful, long-term relationship with the customers, partners and non-profit organizations that shape our vision and values. These relationships make us who we are – a united, engaged workforce that is dedicated to being a positive presence around the globe.
                </p>
              </div>
            </div>

            {/* Right Image/Visual */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-500/20">
                <img 
                  src="/unysisinotechoffice.png" 
                  alt="UNISYS INFOTECH Office"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Our Services Section */}
          <div className="mb-20">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-400">
                Our Services
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-4">
                UNISYS INFOTECH brings a wide array of IT and business consulting skills and a long history of experience across many industries that allows us to expertly tailor our services and solutions to match your business or organizational needs. <span className="text-blue-400 font-semibold">On Time. On Budget. Exceeding Expectations.</span>
              </p>
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300"
            >
              To Know More Contact Us
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
