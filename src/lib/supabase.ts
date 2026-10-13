import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zwfdowendkxrzottdhys.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3ZmRvd2VuZGt4cnpvdHRkaHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4OTkzNTIsImV4cCI6MjEwNzQ3NTM1Mn0.1qbbyZJrRGiV2ArrGlA_TyCy2qH0IhLZ3gulNqXq4_o';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('YOUR_PROJECT_ID')
);

// Inisialisasi klien Supabase resmi
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
