import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wdrqaigkpmsqaxhbpzzv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Oa1kIlaM-QNoO1hVtQl_Tw_9KsjpWvT';

// Create Supabase client with auto-reconnect and retry logic
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Test connection
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('settings').select('id').limit(1);
    return { success: !error, error: error?.message, needsSetup: error?.code === '42P01' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
