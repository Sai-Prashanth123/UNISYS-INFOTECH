import mongoose from 'mongoose';
import ClientLogo from '../models/ClientLogo.js';
import dotenv from 'dotenv';

dotenv.config();

const clientLogos = [
  {
    name: 'First Citizens Bank',
    industry: 'Banking & Financial Services',
    logoUrl: 'https://logo.clearbit.com/firstcitizens.com',
    description: 'Retail, commercial, and wealth management banking services',
    founded: '1898',
    headquarters: 'Raleigh, North Carolina, USA',
    trustSignal: 'One of the largest family-controlled banks in the U.S.',
    displayOrder: 1,
    isActive: true
  },
  {
    name: 'Cisco',
    industry: 'Networking, Cloud, Cybersecurity',
    logoUrl: 'https://logo.clearbit.com/cisco.com',
    description: 'Networking hardware, enterprise software, security solutions',
    founded: '1984',
    headquarters: 'San Jose, California, USA',
    trustSignal: 'Backbone infrastructure provider for enterprises and governments',
    displayOrder: 2,
    isActive: true
  },
  {
    name: 'SunLine',
    industry: 'Public Transportation',
    logoUrl: 'https://logo.clearbit.com/sunline.org',
    description: 'Public transit and mobility services',
    headquarters: 'Thousand Palms, California, USA',
    trustSignal: 'Experience working with municipal and public-sector systems',
    displayOrder: 3,
    isActive: true
  },
  {
    name: 'FIS',
    industry: 'FinTech',
    logoUrl: 'https://logo.clearbit.com/fisglobal.com',
    description: 'Banking, payments, and capital market technology solutions',
    founded: '1968',
    headquarters: 'Jacksonville, Florida, USA',
    trustSignal: 'Powers core financial systems for global banks and enterprises',
    displayOrder: 4,
    isActive: true
  },
  {
    name: 'City of Memphis',
    industry: 'Government / Public Administration',
    logoUrl: 'https://logo.clearbit.com/memphistn.gov',
    description: 'City governance, infrastructure, public services',
    headquarters: 'Memphis, Tennessee, USA',
    trustSignal: 'Indicates compliance with government security and procurement standards',
    displayOrder: 5,
    isActive: true
  },
  {
    name: 'Apolis',
    industry: 'IT Consulting & Staffing',
    logoUrl: 'https://logo.clearbit.com/apolisgroup.com',
    description: 'IT consulting, digital transformation, cloud and enterprise solutions',
    headquarters: 'United States',
    trustSignal: 'Enterprise-grade consulting and delivery capabilities',
    displayOrder: 6,
    isActive: true
  },
  {
    name: 'Dorpass',
    industry: 'Technology Solutions',
    logoUrl: 'https://logo.clearbit.com/dorpass.com',
    description: 'Technology consulting and solutions provider',
    headquarters: 'United States',
    trustSignal: 'Trusted technology partner for enterprise clients',
    displayOrder: 7,
    isActive: true
  },
  {
    name: 'InfoVision',
    industry: 'IT Services & Digital Transformation',
    logoUrl: 'https://logo.clearbit.com/infovisioninc.com',
    description: 'Digital engineering, cloud, data, and enterprise IT services',
    founded: '1995',
    headquarters: 'Fremont, California, USA',
    trustSignal: 'Long-term enterprise IT partner for global organizations',
    displayOrder: 8,
    isActive: true
  },
  {
    name: '4i',
    industry: 'Data Analytics & Business Intelligence',
    logoUrl: 'https://logo.clearbit.com/4iapps.com',
    description: 'Data analytics, business intelligence, and enterprise applications',
    headquarters: 'United States',
    trustSignal: 'Data-driven solutions for enterprise decision making',
    displayOrder: 9,
    isActive: true
  },
  {
    name: 'Houlihan Lokey',
    industry: 'Investment Banking',
    logoUrl: 'https://logo.clearbit.com/hl.com',
    description: 'M&A advisory, restructuring, capital markets',
    founded: '1972',
    headquarters: 'Los Angeles, California, USA',
    trustSignal: 'Leading global investment bank for complex financial transactions',
    displayOrder: 10,
    isActive: true
  },
  {
    name: 'Oracle',
    industry: 'Enterprise Software & Cloud',
    logoUrl: 'https://logo.clearbit.com/oracle.com',
    description: 'Databases, cloud infrastructure, ERP, enterprise applications',
    founded: '1977',
    headquarters: 'Austin, Texas, USA',
    trustSignal: 'Mission-critical software used by Fortune 500 companies worldwide',
    displayOrder: 11,
    isActive: true
  }
];

async function seedClientLogos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unisys-infotech');
    console.log('Connected to MongoDB');

    // Clear existing logos
    await ClientLogo.deleteMany({});
    console.log('Cleared existing client logos');

    // Insert new logos
    const result = await ClientLogo.insertMany(clientLogos);
    console.log(`Successfully seeded ${result.length} client logos`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding client logos:', error);
    process.exit(1);
  }
}

seedClientLogos();
