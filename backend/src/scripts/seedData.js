import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Client from '../models/Client.js';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Try to connect to database with fallback to local MongoDB
    let mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unisys-infotech';
    
    try {
      await mongoose.connect(mongoURI);
      console.log('✓ Connected to MongoDB');
    } catch (firstError) {
      // If primary connection fails and it's not already the local fallback, try local
      if (process.env.MONGODB_URI && !mongoURI.includes('localhost')) {
        console.log('Primary MongoDB connection failed, trying local MongoDB...');
        mongoURI = 'mongodb://localhost:27017/unisys-infotech';
        await mongoose.connect(mongoURI);
        console.log('✓ Connected to local MongoDB');
      } else {
        throw firstError;
      }
    }

    // Create admin user (password will be hashed by User model pre-save hook)
    const existingAdmin = await User.findOne({ email: 'admin@unisysinfotech.com' });
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@unisysinfotech.com',
        password: 'password123',
        role: 'admin',
        designation: 'Administrator',
        department: 'Management',
        isActive: true
      });
      await adminUser.save();
      console.log('✓ Admin user created');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Create sample users
    const sampleUsers = [
      {
        name: 'John Developer',
        email: 'john.dev@unisysinfotech.com',
        password: 'password123',
        role: 'user',
        designation: 'Senior Software Engineer',
        department: 'Engineering'
      },
      {
        name: 'Sarah QA',
        email: 'sarah.qa@unisysinfotech.com',
        password: 'password123',
        role: 'user',
        designation: 'QA Engineer',
        department: 'Quality Assurance'
      },
      {
        name: 'Mike DevOps',
        email: 'mike.devops@unisysinfotech.com',
        password: 'password123',
        role: 'user',
        designation: 'DevOps Engineer',
        department: 'Infrastructure'
      }
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
      }
    }
    console.log('✓ Sample users created/verified');

    // Create sample clients
    const sampleClients = [
      {
        name: 'Tech Solutions Inc',
        email: 'contact@techsolutions.com',
        industry: 'Technology',
        contactPerson: 'Robert Johnson',
        phone: '+1-555-0101',
        address: '123 Tech Street, San Francisco, CA 94102',
        status: 'active'
      },
      {
        name: 'Finance Plus LLC',
        email: 'info@financeplus.com',
        industry: 'Financial Services',
        contactPerson: 'Emma Smith',
        phone: '+1-555-0102',
        address: '456 Finance Ave, New York, NY 10001',
        status: 'active'
      },
      {
        name: 'HealthCare Digital',
        email: 'support@healthcaredigital.com',
        industry: 'Healthcare',
        contactPerson: 'Dr. Lisa Brown',
        phone: '+1-555-0103',
        address: '789 Medical Plaza, Boston, MA 02108',
        status: 'active'
      },
      {
        name: 'Retail Connect',
        email: 'hello@retailconnect.com',
        industry: 'Retail',
        contactPerson: 'David Wilson',
        phone: '+1-555-0104',
        address: '321 Commerce Blvd, Atlanta, GA 30303',
        status: 'active'
      }
    ];

    for (const clientData of sampleClients) {
      const existingClient = await Client.findOne({ email: clientData.email });
      if (!existingClient) {
        const client = new Client(clientData);
        await client.save();
      }
    }
    console.log('✓ Sample clients created/verified');

    console.log('\n✅ Database seeded successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run seed
seedDatabase();
