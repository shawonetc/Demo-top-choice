const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      console.log('Products sample:', data);
    }

    const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
    if (pError) {
      console.error('Error fetching profiles:', pError);
    } else {
      console.log('Profiles:', profiles);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

test();
