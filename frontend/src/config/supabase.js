import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration for Frontend
 * Uses the anon/publishable key for client-side operations
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kwqabttdbdslmjzbcppo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cWFidHRkYmRzbG1qemJjcHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzAxNTksImV4cCI6MjA4MzYwNjE1OX0.MsT5zvZbeFOr-PwmzlHreAQriNsfHa9LtTseIyFvq88';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

