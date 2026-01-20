import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL is required in environment variables');
  console.error('   Set it as an environment variable or in your .env file');
  console.error('   For Docker: Pass it via -e flag or docker-compose environment section');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required in environment variables');
  console.error('   Get it from: Supabase Dashboard -> Project Settings -> API -> service_role key');
  console.error('   For Docker: Pass it via -e flag or docker-compose environment section');
  process.exit(1);
}

// Create Supabase client with service role key for server-side operations
// This bypasses Row Level Security (RLS) - only use on the server side
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Test connection
export const connectDB = async () => {
  try {
    // Simple query to test connection
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      // PGRST116 means no rows returned, which is fine for empty table
      if (error.code !== 'PGRST116' && error.message !== 'JSON object requested, multiple (or no) rows returned') {
        throw error;
      }
    }
    console.log('✓ Supabase connected successfully');
    console.log(`   Project: ${supabaseUrl}`);
    return true;
  } catch (error) {
    console.error('✗ Supabase connection failed:', error.message);
    console.error('');
    console.error('Please ensure the following are set in your .env file:');
    console.error('  1. SUPABASE_URL=<your-supabase-url>');
    console.error('  2. SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>');
    console.error('');
    console.error('Get your credentials from:');
    console.error('  Supabase Dashboard -> Project Settings -> API');
    return false;
  }
};

export default supabase;

