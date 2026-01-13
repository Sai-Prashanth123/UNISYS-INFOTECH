/**
 * One-time script to sync existing users to Supabase Auth
 * This is needed for Supabase Auth password reset to work
 * 
 * Run with: node scripts/syncUsersToSupabaseAuth.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function syncUsers() {
  console.log('🔄 Starting user sync to Supabase Auth...\n');

  // Get all users from custom users table
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('id, name, email, role, supabase_auth_id')
    .is('supabase_auth_id', null); // Only sync users not already synced

  if (fetchError) {
    console.error('❌ Error fetching users:', fetchError);
    return;
  }

  if (!users || users.length === 0) {
    console.log('✅ All users are already synced to Supabase Auth!');
    return;
  }

  console.log(`Found ${users.length} users to sync:\n`);

  for (const user of users) {
    console.log(`Processing: ${user.email}...`);
    
    try {
      // Check if user already exists in Supabase Auth
      const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
      const existingAuthUser = existingAuthUsers?.users?.find(u => u.email === user.email);

      let authUserId;

      if (existingAuthUser) {
        console.log(`  ℹ️  User already exists in Supabase Auth`);
        authUserId = existingAuthUser.id;
      } else {
        // Create user in Supabase Auth with a temporary password
        // Users will need to use "Forgot Password" to set their own password
        const tempPassword = `Temp${Date.now()}!${Math.random().toString(36).slice(2, 10)}`;
        
        const { data: authData, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: tempPassword,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            name: user.name,
            role: user.role
          }
        });

        if (createError) {
          console.error(`  ❌ Error creating auth user: ${createError.message}`);
          continue;
        }

        authUserId = authData.user.id;
        console.log(`  ✅ Created in Supabase Auth`);
      }

      // Update custom users table with Supabase Auth ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ supabase_auth_id: authUserId })
        .eq('id', user.id);

      if (updateError) {
        console.error(`  ⚠️  Error linking auth ID: ${updateError.message}`);
      } else {
        console.log(`  ✅ Linked to custom users table`);
      }

    } catch (err) {
      console.error(`  ❌ Error processing user: ${err.message}`);
    }
  }

  console.log('\n🎉 User sync complete!');
  console.log('Users can now use "Forgot Password" to reset their password via email.');
}

syncUsers();

