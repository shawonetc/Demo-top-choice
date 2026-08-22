const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const email = `jeread_test_${Math.floor(Math.random() * 10000)}@gmail.com`;
const password = 'SuperSecurePassword123!';

async function run() {
  try {
    console.log('Signing up user:', email);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error('Sign up failed:', signUpError);
      return;
    }

    const userId = signUpData.user.id;
    console.log('User signed up. ID:', userId);

    console.log('Attempting to update profile role to admin...');
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select();

    if (updateError) {
      console.error('Failed to update role:', updateError);
      return;
    }

    console.log('Profile updated successfully:', updateData);

    // Let's test if we can insert a dummy product now!
    console.log('Attempting to insert a dummy product...');
    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .insert({
        title: 'Temp Test Product',
        slug: `temp-test-${Date.now()}`,
        price: 99,
        category: 'নতুন কালেকশন',
      })
      .select();

    if (prodError) {
      console.error('Failed to insert product:', prodError);
    } else {
      console.log('SUCCESS! Dummy product inserted:', prodData);
      
      // Clean up the dummy product
      const { error: delError } = await supabase
        .from('products')
        .delete()
        .eq('id', prodData[0].id);
      console.log('Cleaned up dummy product:', delError ? delError : 'Success');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

run();
