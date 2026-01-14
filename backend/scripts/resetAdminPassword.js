/**
 * Script to reset admin password to "password123"
 * Run with: node scripts/resetAdminPassword.js
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://kwqabttdbdslmjzbcppo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetAdminPassword() {
  try {
    console.log('🔄 Resetting admin password...\n');

    // Hash the password "password123"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Update admin user password
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'admin@unisys.com')
      .select();

    if (error) {
      console.error('❌ Error updating admin password:', error);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.error('❌ Admin user not found with email: admin@unisys.com');
      console.log('\nCreating admin user...');
      
      // Create admin user if it doesn't exist
      const { data: newAdmin, error: createError } = await supabase
        .from('users')
        .insert({
          name: 'Admin User',
          email: 'admin@unisys.com',
          password: hashedPassword,
          role: 'admin',
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating admin user:', createError);
        process.exit(1);
      }

      console.log('✅ Admin user created successfully!\n');
    } else {
      console.log('✅ Admin password reset successfully!\n');
    }

    // Verify the admin user
    const { data: admin, error: verifyError } = await supabase
      .from('users')
      .select('id, name, email, role, is_active')
      .eq('email', 'admin@unisys.com')
      .single();

    if (verifyError || !admin) {
      console.error('❌ Error verifying admin user:', verifyError);
      process.exit(1);
    }

    console.log('='.repeat(60));
    console.log('✅ ADMIN CREDENTIALS - READY TO USE');
    console.log('='.repeat(60));
    console.log('');
    console.log('  Email:    admin@unisys.com');
    console.log('  Password: password123');
    console.log('  Role:     admin');
    console.log('  Status:   Active');
    console.log('');
    console.log('='.repeat(60));
    console.log('');
    console.log('🎉 You can now log in to the admin dashboard!');
    console.log('');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

resetAdminPassword();
