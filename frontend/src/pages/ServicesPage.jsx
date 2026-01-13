import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/index.js';
import { 
  Code, 
  GitBranch, 
  Cloud, 
  Brain, 
  CheckSquare, 
  BarChart3, 
  Users, 
  Target, 
  Briefcase, 
  Database,
  Server,
  Cpu,
  Shield,
  Zap,
  Package,
  Boxes
} from 'lucide-react';
import { ServiceCard } from '../components/ui/ServiceCard.jsx';
import { TechChip } from '../components/ui/TechChip.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Button } from '../components/ui/Button.jsx';

export const ServicesPage = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const navigate = useNavigate();

  const services = [
    {
      icon: Code,
      title: 'Software Development',
      description: 'Custom applications built with modern technologies and best practices',
      features: ['Web Applications', 'Mobile Apps', 'Enterprise Solutions', 'Cloud-Native Architecture'],
      link: '/services/software-development'
    },
    {
      icon: GitBranch,
      title: 'DevOps',
      description: 'Streamline your development and operations with automation and best practices',
      features: ['CI/CD Pipelines', 'Container Orchestration', 'Infrastructure as Code', 'Continuous Integration'],
      link: '/services/devops'
    },
    {
      icon: Cloud,
      title: 'Cloud Services',
      description: 'Cloud infrastructure optimization and migration expertise',
      features: ['Cloud Migration', 'Multi-Cloud Strategy', 'Cloud Architecture', 'Cost Optimization'],
      link: '/services/cloud-services'
    },
    {
      icon: Brain,
      title: 'Data Science & AI',
      description: 'Unlock insights from your data with advanced analytics',
      features: ['Predictive Analytics', 'Machine Learning', 'Big Data Processing', 'Data Visualization'],
      link: '/services/data-science'
    },
    {
      icon: CheckSquare,
      title: 'QA & Automation',
      description: 'Comprehensive testing solutions ensuring quality and reliability',
      features: ['Test Automation', 'Performance Testing', 'Security Testing', 'Continuous Testing'],
      link: '/services/qa'
    },
    {
      icon: BarChart3,
      title: 'Business Intelligence',
      description: 'Data-driven insights for informed decision making',
      features: ['Dashboard Creation', 'Report Generation', 'Data Warehousing', 'Analytics Strategy'],
      link: '/services/business-intelligence'
    },
    {
      icon: Users,
      title: 'CRM',
      description: 'Customer relationship management to track and manage customer interactions',
      features: ['Contact Management', 'Sales Pipeline', 'Customer Analytics', 'Marketing Automation'],
      link: '/services/crm'
    },
    {
      icon: Briefcase,
      title: 'Professional Services',
      description: 'Comprehensive IT professional services tailored to your business needs',
      features: ['Oracle Solutions', 'E-Business Suite', 'Cloud ERP & HCM', 'Enterprise Performance Management'],
      link: '/services/professional'
    },
    {
      icon: Database,
      title: 'Database Administrator',
      description: 'Expert database management, maintenance, and security services',
      features: ['Data Management', 'Performance Optimization', 'Security & Compliance', 'Enterprise Data Solutions'],
      link: '/services/dba'
    }
  ];

  return (
    <div className={isDark ? 'bg-slate-900 text-white' : 'bg-slate-50'}>
      {/* Hero Section with Background Image */}
      <section 
        className="relative py-24 px-4 min-h-[500px] flex items-center animate-fade-in"
        style={{
          backgroundImage: 'url("/unisysinfotechservicespage.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay for text readability */}
        <div className={`absolute inset-0 ${isDark ? 'bg-slate-900/85' : 'bg-slate-900/80'}`} />
        
        {/* Content */}
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Our Services
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto">
            Comprehensive IT solutions tailored to your business needs
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className={`py-20 px-4 ${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-800' : 'bg-white'} animate-fade-in`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="animate-slide-up" style={{animationDelay: `${idx * 0.05}s`}}>
                <ServiceCard
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  features={service.features}
                  link={service.link}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className={`py-20 px-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'} animate-fade-in`}>
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            title="Technology Stack" 
            subtitle="Powered by industry-leading technologies and frameworks"
          />
          
          {/* Languages & Frameworks */}
          <div className="mb-8">
            <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Languages & Frameworks
            </h3>
            <div className="overflow-hidden">
              <div className="flex gap-3" style={{animation: 'slideRight 20s linear infinite reverse'}}>
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" label="Node.js" variant="primary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" label="Express" variant="primary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" label="React" variant="primary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" label="Vue.js" variant="primary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" label="Python" variant="primary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg" label="Django" variant="primary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" label="Java" variant="primary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" label="Spring Boot" variant="primary" />
                {/* Duplicate for seamless loop */}
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" label="Node.js" variant="primary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" label="Express" variant="primary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" label="React" variant="primary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" label="Vue.js" variant="primary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" label="Python" variant="primary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg" label="Django" variant="primary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" label="Java" variant="primary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" label="Spring Boot" variant="primary" />
              </div>
            </div>
          </div>

          {/* Cloud & Infrastructure */}
          <div className="mb-8">
            <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Cloud & Infrastructure
            </h3>
            <div className="overflow-hidden">
              <div className="flex gap-3" style={{animation: 'slideRight 20s linear infinite'}}>
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" label="AWS" variant="secondary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" label="Microsoft Azure" variant="secondary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg" label="Google Cloud" variant="secondary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" label="Docker" variant="secondary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" label="Kubernetes" variant="secondary" />
                {/* Duplicate for seamless loop */}
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" label="AWS" variant="secondary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" label="Microsoft Azure" variant="secondary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg" label="Google Cloud" variant="secondary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" label="Docker" variant="secondary" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" label="Kubernetes" variant="secondary" />
              </div>
            </div>
          </div>

          {/* Databases & Tools */}
          <div>
            <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Databases & Tools
            </h3>
            <div className="overflow-hidden">
              <div className="flex gap-3" style={{animation: 'slideRight 20s linear infinite reverse'}}>
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" label="MongoDB" variant="accent" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" label="PostgreSQL" variant="accent" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/salesforce/salesforce-original.svg" label="Salesforce" variant="accent" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg" label="Oracle" variant="accent" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg" label="Jenkins" variant="accent" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg" label="GitLab CI" variant="accent" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg" label="Terraform" variant="accent" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg" label="Ansible" variant="accent" />
                {/* Duplicate for seamless loop */}
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" label="MongoDB" variant="accent" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" label="PostgreSQL" variant="accent" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/salesforce/salesforce-original.svg" label="Salesforce" variant="accent" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg" label="Oracle" variant="accent" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg" label="Jenkins" variant="accent" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg" label="GitLab CI" variant="accent" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg" label="Terraform" variant="accent" />
                <TechChip logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg" label="Ansible" variant="accent" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
