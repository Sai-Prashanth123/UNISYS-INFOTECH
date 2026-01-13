import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@unisysinfotech.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Update password to ensure it's correct
      const salt = await bcrypt.genSalt(10);
      existingAdmin.password = await bcrypt.hash('password123', salt);
      await existingAdmin.save();
      console.log('Admin password updated to: password123');
    } else {
      // Create new admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const admin = new User({
        name: 'Admin User',
        email: 'admin@unisysinfotech.com',
        password: hashedPassword,
        role: 'admin'
      });

      await admin.save();
      console.log('Admin user created successfully');
      console.log('Email: admin@unisysinfotech.com');
      console.log('Password: password123');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
