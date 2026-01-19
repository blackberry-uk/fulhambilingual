
import { createClient } from '@supabase/supabase-js';

// Using import.meta.env which is the standard for Vite projects
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only initialize if the URL and Key are provided. 
// This prevents the "supabaseUrl is required" crash during build/dev if not set.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
