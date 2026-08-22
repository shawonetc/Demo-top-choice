const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DOWNLOADS_DIR = 'D:\\Dawnload';

async function run() {
  try {
    console.log('Logging in as pro@gmail.com...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'pro@gmail.com',
      password: '225588'
    });

    if (authError) {
      console.error('Authentication failed:', authError.message);
      return;
    }

    console.log('Logged in successfully. Session user ID:', authData.user.id);

    // Read the D:\Dawnload folder
    if (!fs.existsSync(DOWNLOADS_DIR)) {
      console.error(`Directory ${DOWNLOADS_DIR} does not exist.`);
      return;
    }

    const files = fs.readdirSync(DOWNLOADS_DIR);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });

    console.log(`Found ${imageFiles.length} image files to process.`);

    for (let i = 0; i < imageFiles.length; i++) {
      const fileName = imageFiles[i];
      const filePath = path.join(DOWNLOADS_DIR, fileName);
      console.log(`\n[${i + 1}/${imageFiles.length}] Processing: ${fileName}`);

      // 1. Read file buffer
      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(fileName).toLowerCase();
      const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

      // 2. Generate unique name for Supabase storage
      const uniqueFileName = `premium-shirt-${i + 1}-${Date.now()}${ext}`;

      console.log(`Uploading to Supabase Storage as: ${uniqueFileName}...`);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(uniqueFileName, fileBuffer, {
          contentType,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error(`Failed to upload ${fileName}:`, uploadError.message);
        continue;
      }

      console.log('Upload successful.');

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(uniqueFileName);

      console.log(`Public URL: ${publicUrl}`);

      // 4. Insert Product into database
      const title = `Premium Quality Shirt - ${String(i + 1).padStart(2, '0')}`;
      const slug = `premium-quality-shirt-${i + 1}`;
      
      const htmlDescription = `ata স্টাইলিশ ও আরামদায়ক ডিজাইনের এই শার্টটি প্রতিদিনের ব্যবহার, ক্যাজুয়াল আউটিং ও বিভিন্ন অনুষ্ঠানের জন্য উপযুক্ত।<br/><br/><b>Product Details</b><br/><ul><li>Premium Quality Fabric</li><li>Comfortable & Stylish Design</li><li>Perfect for Casual & Regular Wear</li><li>Available in Different Colors</li><li>Sizes: M, L, XL, XXL</li><li>Easy to Maintain</li></ul><br/><b>Brand:</b> Top Choice<br/><br/><b>Order Now:</b> আপনার পছন্দের Size ও Color নির্বাচন করে অর্ডার করুন।`;
      
      const serializedDescription = JSON.stringify({
        htmlDescription,
        sizes: null,
        product_code: `PQS-${100 + i + 1}`
      });

      console.log(`Inserting product: "${title}" into products table...`);
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .insert({
          title,
          slug,
          description: serializedDescription,
          price: 850, // Default price
          original_price: 1200, // Default original price
          image_url: publicUrl,
          gallery_images: [],
          category: 'Premium Quality Shirt',
          stock_status: 'In Stock',
          call_to_order: '01301697509'
        })
        .select();

      if (prodError) {
        console.error(`Failed to insert product "${title}":`, prodError.message);
      } else {
        console.log(`Successfully added product: "${title}" (ID: ${prodData[0].id})`);
      }
    }

    console.log('\nAll images and products processed.');
  } catch (err) {
    console.error('Unexpected error in run:', err);
  }
}

run();
