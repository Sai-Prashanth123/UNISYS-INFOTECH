/**
 * Emergency script to reset admin password
 * 
 * Usage:
 *   node scripts/resetAdminPassword.js                    → resets to a random secure password
 *   node scripts/resetAdminPassword.js MyNewPassword123   → resets to the given password
 * 
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = 'bhanu.kilaru@unisysinfotech.com';

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
    // Accept custom password from command line, or generate a random one
    const customPassword = process.argv[2];
    const newPassword = customPassword || crypto.randomBytes(12).toString('base64url');

    if (!customPassword) {
      console.log('ℹ️  No password provided. Generating a secure random password.\n');
    }

    if (newPassword.length < 6) {
      console.error('❌ Password must be at least 6 characters');
      process.exit(1);
    }

    console.log(`🔄 Resetting admin password for: ${ADMIN_EMAIL}\n`);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update admin user password
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        must_reset_password: false,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', ADMIN_EMAIL)
      .select();

    if (error) {
      console.error('❌ Error updating admin password:', error);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.error(`❌ Admin user not found with email: ${ADMIN_EMAIL}`);
      console.log('\n  Make sure the admin account exists in the database.');
      process.exit(1);
    }

    // Also sync to Supabase Auth if user has supabase_auth_id
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('supabase_auth_id')
        .eq('email', ADMIN_EMAIL)
        .single();

      if (userData?.supabase_auth_id) {
        await supabase.auth.admin.updateUserById(userData.supabase_auth_id, {
          password: newPassword
        });
        console.log('✅ Supabase Auth password also synced.\n');
      }
    } catch (authErr) {
      console.log('⚠️  Could not sync to Supabase Auth (non-critical):', authErr.message, '\n');
    }

    console.log('='.repeat(60));
    console.log('✅ ADMIN PASSWORD RESET - READY TO USE');
    console.log('='.repeat(60));
    console.log('');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${newPassword}`);
    console.log('');
    console.log('='.repeat(60));
    console.log('');
    console.log('🎉 You can now log in to the admin dashboard!');
    console.log('⚠️  Please change this password immediately after logging in.');
    console.log('');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

resetAdminPassword();
