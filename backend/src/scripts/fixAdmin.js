import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    
    // Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Update admin directly without triggering pre-save hook
    const result = await User.updateOne(
      { email: 'admin@unisysinfotech.com' },
      { 
        $set: { 
          password: hashedPassword,
          isActive: true,
          role: 'admin'
        } 
      }
    );

    if (result.matchedCount === 0) {
      // Create new admin if doesn't exist
      await User.create({
        name: 'Admin User',
        email: 'admin@unisysinfotech.com',
        password: 'password123', // Will be hashed by pre-save hook
        role: 'admin',
        isActive: true
      });
      console.log('Admin user created');
    } else {
      console.log('Admin password updated');
    }

    // Verify the admin can login
    const admin = await User.findOne({ email: 'admin@unisysinfotech.com' }).select('+password');
    console.log('\nAdmin Details:');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Active:', admin.isActive);
    
    // Test password
    const isMatch = await bcrypt.compare('password123', admin.password);
    console.log('Password verification:', isMatch ? '✓ CORRECT' : '✗ FAILED');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixAdmin();
