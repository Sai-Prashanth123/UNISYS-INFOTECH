import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const checkAndFixAdmin = async () => {
  try {
    await connectDB();
    console.log('Connected to database...\n');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@unisysinfotech.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found. Creating new admin...');
      
      const newAdmin = new User({
        name: 'Admin User',
        email: 'admin@unisysinfotech.com',
        password: 'password123',
        role: 'admin',
        designation: 'Administrator',
        department: 'Management',
        isActive: true
      });
      
      await newAdmin.save();
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('✅ Admin user found!');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Active:', admin.isActive);
      console.log('Name:', admin.name);
      
      // Test password
      const testPassword = 'password123';
      const isMatch = await bcrypt.compare(testPassword, admin.password);
      console.log('\n🔐 Password test with "password123":', isMatch ? '✅ CORRECT' : '❌ INCORRECT');
      
      if (!isMatch) {
        console.log('\n⚠️  Password mismatch detected. Resetting password...');
        admin.password = 'password123';
        await admin.save();
        console.log('✅ Password reset to "password123"');
      }
    }

    console.log('\n📋 ADMIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    admin@unisysinfotech.com');
    console.log('Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

checkAndFixAdmin();
