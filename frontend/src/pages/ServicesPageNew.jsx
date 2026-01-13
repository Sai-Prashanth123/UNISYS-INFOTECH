import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Shield, GitBranch, Cloud, Database, Target, Brain, BarChart3, Briefcase } from 'lucide-react';

export const ServicesPageNew = () => {
  const services = [
    {
      icon: Code,
      title: 'Software Development',
      description: 'Software Development services is your possibility to outsource software engineering and support, and get maintainable, secure and impactful software at the best price.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      link: '/services/software-development'
    },
    {
      icon: Shield,
      title: 'QA Automation',
      description: 'Comprehensive quality assurance and automated testing services to ensure your software meets the highest standards of quality and reliability.',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      link: '/services/qa'
    },
    {
      icon: GitBranch,
      title: 'DevOps',
      description: 'DevOps is a set of practices, tools, and a cultural philosophy that automate and integrate the processes between software development and IT teams.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      link: '/services/devops'
    },
    {
      icon: Cloud,
      title: 'Cloud Services',
      description: 'Scalable cloud infrastructure solutions that help you deploy, manage, and optimize your applications across multiple cloud platforms.',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      link: '/services/cloud-services'
    },
    {
      icon: Database,
      title: 'Database Administration',
      description: 'Expert database management, optimization, and maintenance services to ensure your data infrastructure runs smoothly and efficiently.',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      link: '/services/dba'
    },
    {
      icon: Target,
      title: 'CRM',
      description: 'CRM (customer relationship management) software tracks and manages customer relationships. It records interactions between a business, its prospects, and its existing customers.',
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
      link: '/services/crm'
    },
    {
      icon: Brain,
      title: 'Data Science',
      description: 'Build expertise in data manipulation, visualization, predictive analytics, machine learning, and data science to launch or advance a successful data career.',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      link: '/services/data-science'
    },
    {
      icon: BarChart3,
      title: 'Business Intelligence',
      description: 'Transform your data into actionable insights with our comprehensive business intelligence solutions and analytics services.',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      link: '/services/business-intelligence'
    },
    {
      icon: Briefcase,
      title: 'Professional Services',
      description: 'IT Professional Services can be defined as the delivery of technology-related services to a customer, allowing them to focus on their core business concerns.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      link: '/services/professional'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-blue-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Our Services</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
            Our Services
          </h1>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Side - Services Image */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-500/20">
                  <img 
                    src="/unisysinfotechservicespage.png" 
                    alt="UNISYS INFOTECH Services"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Services Grid */}
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
            {services.map((service, idx) => {
              const ServiceIcon = service.icon;
              return (
                <div
                  key={idx}
                  className={`group p-8 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border ${service.borderColor} hover:border-opacity-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20`}
                >
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl ${service.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <ServiceIcon className={`w-8 h-8 ${service.color}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-300 transition-colors duration-300">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Learn More Link */}
                  <Link
                    to={service.link}
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300 group-hover:gap-3"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </section>

      {/* Technologies & Tools Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Technologies & Tools We Use
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              Leveraging cutting-edge technologies to deliver exceptional solutions
            </p>
          </div>

          {/* Frontend Technologies */}
          <div className="mb-12 overflow-hidden relative">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Frontend Development</h3>
            <div className="flex gap-4 animate-scroll-left hover:[animation-play-state:paused]">
              {[...Array(3)].flatMap(() => [
                { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
                { name: 'Vue.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
                { name: 'Angular', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
                { name: 'Next.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
                { name: 'TypeScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
                { name: 'Tailwind CSS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' }
              ]).map((tech, idx) => (
                <div 
                  key={idx} 
                  className="group flex-shrink-0 p-6 rounded-xl bg-[#1a2942]/30 border border-blue-900/30 text-center hover:border-blue-500/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer min-w-[150px]"
                >
                  <img 
                    src={tech.logo} 
                    alt={tech.name}
                    loading="lazy"
                    className="w-12 h-12 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300"
                  />
                  <span className="text-white font-semibold text-sm">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Backend Technologies */}
          <div className="mb-12 overflow-hidden relative">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Backend Development</h3>
            <div className="flex gap-4 animate-scroll-right hover:[animation-play-state:paused]">
              {[...Array(3)].flatMap(() => [
                { name: 'Node.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
                { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
                { name: 'Java', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
                { name: 'PHP', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg' },
                { name: '.NET', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg' },
                { name: 'Go', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg' }
              ]).map((tech, idx) => (
                <div 
                  key={idx} 
                  className="group flex-shrink-0 p-6 rounded-xl bg-[#1a2942]/30 border border-blue-900/30 text-center hover:border-blue-500/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer min-w-[150px]"
                >
                  <img 
                    src={tech.logo} 
                    alt={tech.name}
                    loading="lazy"
                    className="w-12 h-12 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300"
                  />
                  <span className="text-white font-semibold text-sm">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Database Technologies */}
          <div className="mb-12 overflow-hidden relative">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Databases</h3>
            <div className="flex gap-4 animate-scroll-left hover:[animation-play-state:paused]">
              {[...Array(3)].flatMap(() => [
                { name: 'MySQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
                { name: 'PostgreSQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
                { name: 'MongoDB', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
                { name: 'Redis', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg' },
                { name: 'Oracle', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg' },
                { name: 'SQL Server', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg' }
              ]).map((tech, idx) => (
                <div 
                  key={idx} 
                  className="group flex-shrink-0 p-6 rounded-xl bg-[#1a2942]/30 border border-blue-900/30 text-center hover:border-blue-500/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer min-w-[150px]"
                >
                  <img 
                    src={tech.logo} 
                    alt={tech.name}
                    loading="lazy"
                    className="w-12 h-12 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300"
                  />
                  <span className="text-white font-semibold text-sm">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cloud & DevOps */}
          <div className="mb-12 overflow-hidden relative">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Cloud & DevOps</h3>
            <div className="flex gap-4 animate-scroll-right hover:[animation-play-state:paused]">
              {[...Array(3)].flatMap(() => [
                { name: 'AWS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg' },
                { name: 'Azure', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg' },
                { name: 'Google Cloud', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg' },
                { name: 'Docker', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
                { name: 'Kubernetes', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg' },
                { name: 'Jenkins', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg' }
              ]).map((tech, idx) => (
                <div 
                  key={idx} 
                  className="group flex-shrink-0 p-6 rounded-xl bg-[#1a2942]/30 border border-blue-900/30 text-center hover:border-blue-500/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer min-w-[150px]"
                >
                  <img 
                    src={tech.logo} 
                    alt={tech.name}
                    loading="lazy"
                    className="w-12 h-12 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300"
                  />
                  <span className="text-white font-semibold text-sm">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testing & QA */}
          <div className="mb-12 overflow-hidden relative">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Testing & QA</h3>
            <div className="flex gap-4 animate-scroll-left hover:[animation-play-state:paused]">
              {[...Array(3)].flatMap(() => [
                { name: 'Selenium', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/selenium/selenium-original.svg' },
                { name: 'Cypress', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cypressio/cypressio-original.svg' },
                { name: 'Jest', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg' },
                { name: 'JUnit', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/junit/junit-original.svg' },
                { name: 'Postman', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postman/postman-original.svg' },
                { name: 'JMeter', logo: 'https://jmeter.apache.org/images/logo.svg' }
              ]).map((tech, idx) => (
                <div 
                  key={idx} 
                  className="group flex-shrink-0 p-6 rounded-xl bg-[#1a2942]/30 border border-blue-900/30 text-center hover:border-blue-500/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer min-w-[150px]"
                >
                  <img 
                    src={tech.logo} 
                    alt={tech.name}
                    loading="lazy"
                    className="w-12 h-12 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300"
                  />
                  <span className="text-white font-semibold text-sm">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data & Analytics */}
          <div className="mb-12 overflow-hidden relative">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Data & Analytics</h3>
            <div className="flex gap-4 animate-scroll-right hover:[animation-play-state:paused]">
              {[...Array(3)].flatMap(() => [
                { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
                { name: 'TensorFlow', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg' },
                { name: 'Power BI', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/New_Power_BI_Logo.svg' },
                { name: 'Tableau', logo: 'https://cdn.worldvectorlogo.com/logos/tableau-software.svg' },
                { name: 'Apache Spark', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/apachespark/apachespark-original.svg' },
                { name: 'Pandas', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg' }
              ]).map((tech, idx) => (
                <div 
                  key={idx} 
                  className="group flex-shrink-0 p-6 rounded-xl bg-[#1a2942]/30 border border-blue-900/30 text-center hover:border-blue-500/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer min-w-[150px]"
                >
                  <img 
                    src={tech.logo} 
                    alt={tech.name}
                    loading="lazy"
                    className="w-12 h-12 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300"
                  />
                  <span className="text-white font-semibold text-sm">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Let's discuss how our services can help transform your business with innovative IT solutions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                Contact Us
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-3.5 bg-[#1a2942] hover:bg-[#1f2f47] border border-blue-900/50 rounded-lg font-semibold transition-all duration-300"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
