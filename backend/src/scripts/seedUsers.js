import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unisys-infotech');
    console.log('✓ Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});
    // console.log('✓ Cleared existing users');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Admin User
    const admin = await User.findOneAndUpdate(
      { email: 'admin@unisys.com' },
      {
        name: 'Admin User',
        email: 'admin@unisys.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('✓ Admin user created');
    console.log('  Email: admin@unisys.com');
    console.log('  Password: password123');
    console.log('  Role: admin');

    // Create Employer User
    const employer = await User.findOneAndUpdate(
      { email: 'employer@unisys.com' },
      {
        name: 'John Manager',
        email: 'employer@unisys.com',
        password: hashedPassword,
        role: 'employer',
        designation: 'Project Manager',
        department: 'Operations',
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('\n✓ Employer user created');
    console.log('  Email: employer@unisys.com');
    console.log('  Password: password123');
    console.log('  Role: employer');

    // Create Employee Users (linked to employer)
    const employee1 = await User.findOneAndUpdate(
      { email: 'employee@unisys.com' },
      {
        name: 'Sarah Smith',
        email: 'employee@unisys.com',
        password: hashedPassword,
        role: 'employee',
        employerId: employer._id,
        designation: 'Software Developer',
        department: 'Engineering',
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('\n✓ Employee user created');
    console.log('  Email: employee@unisys.com');
    console.log('  Password: password123');
    console.log('  Role: employee');
    console.log('  Employer: John Manager');

    const employee2 = await User.findOneAndUpdate(
      { email: 'employee2@unisys.com' },
      {
        name: 'Mike Johnson',
        email: 'employee2@unisys.com',
        password: hashedPassword,
        role: 'employee',
        employerId: employer._id,
        designation: 'QA Engineer',
        department: 'Quality Assurance',
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('\n✓ Employee 2 user created');
    console.log('  Email: employee2@unisys.com');
    console.log('  Password: password123');
    console.log('  Role: employee');
    console.log('  Employer: John Manager');

    // Create Regular User
    const user = await User.findOneAndUpdate(
      { email: 'user@unisys.com' },
      {
        name: 'Jane Doe',
        email: 'user@unisys.com',
        password: hashedPassword,
        role: 'user',
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('\n✓ Regular user created');
    console.log('  Email: user@unisys.com');
    console.log('  Password: password123');
    console.log('  Role: user');

    console.log('\n' + '='.repeat(50));
    console.log('ALL CREDENTIALS SUMMARY');
    console.log('='.repeat(50));
    console.log('\n1. ADMIN ACCESS');
    console.log('   Email: admin@unisys.com');
    console.log('   Password: password123');
    console.log('   Access: All admin pages, user management, reports\n');

    console.log('2. EMPLOYER ACCESS');
    console.log('   Email: employer@unisys.com');
    console.log('   Password: password123');
    console.log('   Access: Employer dashboard, view team timecards\n');

    console.log('3. EMPLOYEE ACCESS');
    console.log('   Email: employee@unisys.com');
    console.log('   Password: password123');
    console.log('   Access: Employee timecards, log hours\n');

    console.log('4. EMPLOYEE 2 ACCESS');
    console.log('   Email: employee2@unisys.com');
    console.log('   Password: password123');
    console.log('   Access: Employee timecards, log hours\n');

    console.log('5. REGULAR USER ACCESS');
    console.log('   Email: user@unisys.com');
    console.log('   Password: password123');
    console.log('   Access: User dashboard, log hours\n');

    console.log('='.repeat(50));
    console.log('✓ All users seeded successfully!');
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
