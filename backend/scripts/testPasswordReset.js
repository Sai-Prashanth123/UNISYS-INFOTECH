/**
 * Test Script for Password Reset
 * Run with: node scripts/testPasswordReset.js
 */

import { createClient } from '@supabase/supabase-js';
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

async function testPasswordReset() {
  try {
    console.log('🧪 Testing Password Reset Configuration...\n');

    // Test 1: Check if user exists in Supabase Auth
    console.log('Test 1: Checking if admin@unisys.com exists in Supabase Auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error listing users:', authError.message);
    } else {
      const adminUser = authUser.users.find(u => u.email === 'admin@unisys.com');
      if (adminUser) {
        console.log('✅ User exists in Supabase Auth');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Confirmed: ${adminUser.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`   Created: ${adminUser.created_at}`);
      } else {
        console.log('❌ User NOT found in Supabase Auth');
      }
    }

    console.log('\n---\n');

    // Test 2: Check custom users table
    console.log('Test 2: Checking custom users table...');
    const { data: customUser, error: customError } = await supabase
      .from('users')
      .select('email, supabase_auth_id')
      .eq('email', 'admin@unisys.com')
      .single();

    if (customError) {
      console.error('❌ Error:', customError.message);
    } else if (customUser) {
      console.log('✅ User exists in custom users table');
      console.log(`   Email: ${customUser.email}`);
      console.log(`   Supabase Auth ID: ${customUser.supabase_auth_id ? 'Linked ✅' : 'Not linked ❌'}`);
    }

    console.log('\n---\n');

    // Test 3: Try to send password reset email
    console.log('Test 3: Attempting to send password reset email...');
    const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(
      'admin@unisys.com',
      {
        redirectTo: 'http://localhost:5173/reset-password'
      }
    );

    if (resetError) {
      console.error('❌ Password reset failed:', resetError.message);
      console.error('\n🔧 SOLUTION:');
      console.error('   1. Go to: https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/settings/auth');
      console.error('   2. Enable "Email" auth provider');
      console.error('   3. Enable "Email confirmations"');
      console.error('   4. Set Site URL to: http://localhost:5173');
      console.error('   5. Save and try again');
    } else {
      console.log('✅ Password reset email sent successfully!');
      console.log('\n📧 Check your email inbox (and spam folder) for admin@unisys.com');
      console.log('\n💡 If you don\'t see the email:');
      console.log('   1. Check spam/junk folder');
      console.log('   2. Wait 1-2 minutes');
      console.log('   3. Check Supabase logs: https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/logs/explorer');
    }

    console.log('\n='.repeat(60));
    console.log('✅ Test complete!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testPasswordReset();
