import dotenv from 'dotenv';
import supabase, { connectDB } from '../config/supabase.js';

dotenv.config();

const updateAdminEmail = async () => {
  try {
    // Connect to Supabase
    await connectDB();
    console.log('✓ Connected to Supabase\n');

    const newEmail = 'admin@unisysinfotech.com';
    const oldEmails = ['admin@unisys.com', 'admin@unisysinfotech.com']; // Check both possible old emails

    // Step 1: Find admin user(s) in the users table
    console.log('🔍 Searching for admin user(s)...');
    
    let adminUser = null;
    let foundEmail = null;

    // Try to find admin by role first
    const { data: adminByRole, error: roleError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError && roleError.code !== 'PGRST116') {
      throw roleError;
    }

    if (adminByRole) {
      adminUser = adminByRole;
      foundEmail = adminByRole.email;
      console.log(`✓ Found admin user with email: ${foundEmail}`);
    } else {
      // Try to find by old email addresses
      for (const oldEmail of oldEmails) {
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', oldEmail)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (user) {
          adminUser = user;
          foundEmail = oldEmail;
          console.log(`✓ Found admin user with email: ${foundEmail}`);
          break;
        }
      }
    }

    if (!adminUser) {
      console.log('❌ No admin user found. Creating new admin user...');
      
      // Create new admin user
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.default.genSalt(10);
      const hashedPassword = await bcrypt.default.hash('password123', salt);

      const { data: newAdmin, error: createError } = await supabase
        .from('users')
        .insert({
          name: 'Admin User',
          email: newEmail,
          password: hashedPassword,
          role: 'admin',
          is_active: true,
          designation: 'Administrator',
          department: 'Management'
        })
        .select()
        .single();

      if (createError) throw createError;

      console.log('✅ New admin user created successfully!');
      console.log(`   Email: ${newEmail}`);
      console.log(`   Password: password123`);
      
      // Also create in Supabase Auth
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: newEmail,
          password: 'password123',
          email_confirm: true,
          user_metadata: {
            name: 'Admin User',
            role: 'admin'
          }
        });

        if (authError) {
          console.log('⚠️  Warning: Could not create Supabase Auth user:', authError.message);
        } else {
          console.log('✅ Supabase Auth user created');
          
          // Link the auth user to the database user
          await supabase
            .from('users')
            .update({ supabase_auth_id: authUser.user.id })
            .eq('id', newAdmin.id);
        }
      } catch (authErr) {
        console.log('⚠️  Warning: Could not create Supabase Auth user:', authErr.message);
      }

      process.exit(0);
    }

    // Step 2: Update email in users table if different
    if (foundEmail.toLowerCase() !== newEmail.toLowerCase()) {
      console.log(`\n📧 Updating email from "${foundEmail}" to "${newEmail}"...`);
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          email: newEmail,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminUser.id)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('✅ Email updated in users table');
      adminUser = updatedUser;
    } else {
      console.log(`✓ Email is already "${newEmail}"`);
    }

    // Step 3: Update email in Supabase Auth if linked
    if (adminUser.supabase_auth_id) {
      console.log('\n🔐 Updating Supabase Auth user...');
      
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.updateUserById(
          adminUser.supabase_auth_id,
          {
            email: newEmail,
            email_confirm: true
          }
        );

        if (authError) {
          console.log('⚠️  Warning: Could not update Supabase Auth user:', authError.message);
        } else {
          console.log('✅ Supabase Auth email updated');
        }
      } catch (authErr) {
        console.log('⚠️  Warning: Could not update Supabase Auth user:', authErr.message);
      }
    } else {
      // Try to find and link existing auth user
      console.log('\n🔍 Searching for Supabase Auth user...');
      
      try {
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        
        if (!listError && users) {
          const authUser = users.find(u => 
            u.email === foundEmail || u.email === newEmail
          );

          if (authUser) {
            // Update auth user email
            const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
              authUser.id,
              {
                email: newEmail,
                email_confirm: true
              }
            );

            if (updateAuthError) {
              console.log('⚠️  Warning: Could not update Supabase Auth user:', updateAuthError.message);
            } else {
              console.log('✅ Supabase Auth email updated');
              
              // Link auth user to database user
              await supabase
                .from('users')
                .update({ supabase_auth_id: authUser.id })
                .eq('id', adminUser.id);
            }
          } else {
            // Create new auth user
            const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
              email: newEmail,
              password: 'password123',
              email_confirm: true,
              user_metadata: {
                name: adminUser.name || 'Admin User',
                role: 'admin'
              }
            });

            if (createAuthError) {
              console.log('⚠️  Warning: Could not create Supabase Auth user:', createAuthError.message);
            } else {
              console.log('✅ Supabase Auth user created');
              
              // Link auth user to database user
              await supabase
                .from('users')
                .update({ supabase_auth_id: newAuthUser.user.id })
                .eq('id', adminUser.id);
            }
          }
        }
      } catch (authErr) {
        console.log('⚠️  Warning: Could not access Supabase Auth:', authErr.message);
      }
    }

    // Step 4: Verify the update
    console.log('\n📋 Verifying admin user...');
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('id, name, email, role, is_active, supabase_auth_id')
      .eq('id', adminUser.id)
      .single();

    if (verifyError) throw verifyError;

    console.log('\n✅ ADMIN USER UPDATED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Name:     ${verifyUser.name || 'Admin User'}`);
    console.log(`Email:    ${verifyUser.email}`);
    console.log(`Role:     ${verifyUser.role}`);
    console.log(`Active:   ${verifyUser.is_active ? 'Yes' : 'No'}`);
    console.log(`Auth ID:  ${verifyUser.supabase_auth_id || 'Not linked'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating admin email:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

updateAdminEmail();


