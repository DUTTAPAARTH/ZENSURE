const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const hasValidConfig =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  /^https?:\/\//i.test(supabaseUrl) &&
  !supabaseUrl.includes('YOUR_SUPABASE_URL') &&
  !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY');

if (!hasValidConfig) {
  console.warn('Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.');
}

const supabase = hasValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy(
      {},
      {
        get() {
          throw new Error('Supabase client is not configured. Update SUPABASE_URL and SUPABASE_ANON_KEY.');
        },
      }
    );

module.exports = supabase;
