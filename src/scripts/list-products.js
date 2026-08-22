const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Total products:', data.length);
    data.forEach(p => {
      console.log(`- ID: ${p.id}, Title: "${p.title}", Price: ${p.price}, Category: "${p.category}"`);
    });
  }
}

run();
