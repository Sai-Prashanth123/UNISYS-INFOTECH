import mongoose from 'mongoose';
import ClientLogo from '../models/ClientLogo.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const featuredLogos = [
  {
    name: 'Microsoft',
    industry: 'Technology & Cloud Services',
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
    description: 'Enterprise software, cloud computing, and AI solutions',
    displayOrder: 1,
    isActive: true
  },
  {
    name: 'Amazon Web Services',
    industry: 'Cloud Computing',
    logoUrl: 'https://logo.clearbit.com/aws.amazon.com',
    description: 'Leading cloud infrastructure and platform services',
    displayOrder: 2,
    isActive: true
  },
  {
    name: 'Google Cloud',
    industry: 'Cloud & AI Services',
    logoUrl: 'https://logo.clearbit.com/cloud.google.com',
    description: 'Cloud computing, data analytics, and machine learning',
    displayOrder: 3,
    isActive: true
  },
  {
    name: 'IBM',
    industry: 'Enterprise Technology',
    logoUrl: 'https://logo.clearbit.com/ibm.com',
    description: 'Enterprise solutions, AI, and consulting services',
    displayOrder: 4,
    isActive: true
  }
];

const addFeaturedLogos = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Clear existing logos
    await ClientLogo.deleteMany({});
    console.log('Cleared existing logos');

    // Insert featured logos
    await ClientLogo.insertMany(featuredLogos);
    console.log('✅ Featured company logos added successfully!');
    console.log(`Added ${featuredLogos.length} logos: Microsoft, AWS, Google Cloud, IBM`);

    process.exit(0);
  } catch (error) {
    console.error('Error adding featured logos:', error);
    process.exit(1);
  }
};

addFeaturedLogos();
