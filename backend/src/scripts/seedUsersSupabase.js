import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import supabase, { connectDB } from '../config/supabase.js';

dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to Supabase
    await connectDB();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Admin User
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@unisys.com')
      .maybeSingle();

    if (adminError && adminError.code !== 'PGRST116') {
      throw adminError;
    }

    if (!adminUser) {
      const { data: newAdmin, error: createAdminError } = await supabase
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

      if (createAdminError) throw createAdminError;
      console.log('✓ Admin user created');
      console.log('  Email: admin@unisys.com');
      console.log('  Password: password123');
      console.log('  Role: admin');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Create Employer User
    const { data: employerUser, error: employerError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'employer@unisys.com')
      .maybeSingle();

    if (employerError && employerError.code !== 'PGRST116') {
      throw employerError;
    }

    if (!employerUser) {
      const { data: newEmployer, error: createEmployerError } = await supabase
        .from('users')
        .insert({
          name: 'John Manager',
          email: 'employer@unisys.com',
          password: hashedPassword,
          role: 'employer',
          designation: 'Project Manager',
          department: 'Operations',
          is_active: true
        })
        .select()
        .single();

      if (createEmployerError) throw createEmployerError;
      console.log('\n✓ Employer user created');
      console.log('  Email: employer@unisys.com');
      console.log('  Password: password123');
      console.log('  Role: employer');
    } else {
      console.log('✓ Employer user already exists');
    }

    // Create Employee Users
    const { data: employeeUser, error: employeeError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'employee@unisys.com')
      .maybeSingle();

    if (employeeError && employeeError.code !== 'PGRST116') {
      throw employeeError;
    }

    // Get employer ID for linking
    const { data: employer } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'employer@unisys.com')
      .single();

    if (!employeeUser) {
      const { data: newEmployee, error: createEmployeeError } = await supabase
        .from('users')
        .insert({
          name: 'Sarah Smith',
          email: 'employee@unisys.com',
          password: hashedPassword,
          role: 'employee',
          employer_id: employer?.id || null,
          designation: 'Software Developer',
          department: 'Engineering',
          is_active: true
        })
        .select()
        .single();

      if (createEmployeeError) throw createEmployeeError;
      console.log('\n✓ Employee user created');
      console.log('  Email: employee@unisys.com');
      console.log('  Password: password123');
      console.log('  Role: employee');
    } else {
      console.log('✓ Employee user already exists');
    }

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


