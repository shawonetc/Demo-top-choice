import { supabase } from '../lib/supabase';

export interface Product {
  id: number;
  slug: string;
  title: string;
  price: number;
  maxPrice?: number;
  originalPrice?: number;
  imageUrl: string;
  galleryImages?: string[];
  description?: string;
  category?: string;
  stockStatus: 'In Stock' | 'Out Of Stock';
  callToOrder?: string;
  productCode?: string;
}

export const mockProducts: Product[] = [
  { 
    id: 1, 
    slug: 'waterproof-bed-cover',
    title: 'Waterproof Bed Cover (6/7 Feet)', 
    price: 1250, 
    originalPrice: 1500, 
    imageUrl: '/images/products/waterproof_bed_cover.png',
    galleryImages: [
      '/images/products/waterproof_bed_cover.png',
    ],
    description: '<p>100% waterproof bed cover that protects your mattress from spills and stains. Breathable, quiet, and fits beds up to 7 feet.</p><ul><li>High-quality materials</li><li>Machine washable</li><li>Hypoallergenic</li></ul>',
    category: 'ওয়াটারপ্রুফ চাদর',
    stockStatus: 'In Stock',
    callToOrder: '01942-838348'
  },
  { 
    id: 2, 
    slug: 'portable-mini-turbo-fan',
    title: 'Portable Mini Turbo Fan', 
    price: 650, 
    originalPrice: 900, 
    imageUrl: '/images/products/mini_turbo_fan.png',
    galleryImages: [
      '/images/products/mini_turbo_fan.png',
    ],
    description: '<p>Stay cool anywhere with this portable mini turbo fan. Features 3 speed settings and a long-lasting rechargeable battery.</p>',
    stockStatus: 'In Stock',
    callToOrder: '01942-838348'
  },
  { 
    id: 3, 
    slug: 'plug-in-quran',
    title: 'Plug in Quran', 
    price: 450, 
    imageUrl: '/images/products/plug_in_quran.png',
    galleryImages: [
      '/images/products/plug_in_quran.png'
    ],
    description: '<p>Listen to beautiful Quran recitations simply by plugging this device into any standard outlet.</p>',
    category: 'মশারী',
    stockStatus: 'Out Of Stock',
    callToOrder: '01942-838348'
  },
  {
    id: 101,
    slug: 'diaper-5pcs',
    title: '৫ পিস রি-ইউজেবল ডায়াপার',
    price: 950,
    imageUrl: '/images/products/diaper1.png',
    category: 'ডায়াপার',
    stockStatus: 'In Stock',
    callToOrder: '01942-838348'
  },
  {
    id: 102,
    slug: 'diaper-4pcs',
    title: '৪ পিস রি-ইউজেবল ডায়াপার',
    price: 850,
    imageUrl: '/images/products/diaper2.png',
    category: 'ডায়াপার',
    stockStatus: 'In Stock',
    callToOrder: '01942-838348'
  },
  {
    id: 103,
    slug: 'diaper-3pcs',
    title: '৩ পিস রি-ইউজেবল ডায়াপার',
    price: 550,
    imageUrl: '/images/products/diaper3.png',
    category: 'ডায়াপার',
    stockStatus: 'In Stock',
    callToOrder: '01942-838348'
  },
  {
    id: 104,
    slug: 'diaper-2pcs',
    title: '২ পিস রি-ইউজেবল ডায়াপার',
    price: 450,
    imageUrl: '/images/products/diaper4.png',
    category: 'ডায়াপার',
    stockStatus: 'In Stock',
    callToOrder: '01942-838348'
  },
  {
    id: 201,
    slug: 'new-product-1',
    title: 'প্রোডাক্ট কালেকশন ১',
    price: 850,
    imageUrl: '/product/WhatsApp Image 2026-08-15 at 6.14.30 PM.jpeg',
    category: 'নতুন কালেকশন',
    stockStatus: 'In Stock',
    callToOrder: '01942-838348'
  },
  {
    id: 202,
    slug: 'new-product-2',
    title: 'প্রোডাক্ট কালেকশন ২',
    price: 950,
    imageUrl: '/product/WhatsApp Image 2026-08-15 at 6.14.30 PM (1).jpeg',
    category: 'নতুন কালেকশন',
    stockStatus: 'In Stock',
    callToOrder: '01942-838348'
  },
  {
    id: 203,
    slug: 'new-product-3',
    title: 'প্রোডাক্ট কালেকশন ৩',
    price: 750,
    imageUrl: '/product/WhatsApp Image 2026-08-15 at 6.14.31 PM.jpeg',
    category: 'নতুন কালেকশন',
    stockStatus: 'In Stock',
    callToOrder: '01942-838348'
  },
  {
    id: 204,
    slug: 'new-product-4',
    title: 'প্রোডাক্ট কালেকশন ৪',
    price: 650,
    imageUrl: '/product/WhatsApp Image 2026-08-15 at 6.14.31 PM (1).jpeg',
    category: 'নতুন কালেকশন',
    stockStatus: 'In Stock',
    callToOrder: '01942-838348'
  },
  {
    id: 205,
    slug: 'new-product-5',
    title: 'প্রোডাক্ট কালেকশন ৫',
    price: 1200,
    imageUrl: '/product/WhatsApp Image 2026-08-15 at 6.14.32 PM.jpeg',
    category: 'নতুন কালেকশন',
    stockStatus: 'In Stock',
    callToOrder: '01942-838348'
  },
  {
    id: 206,
    slug: 'new-product-6',
    title: 'প্রোডাক্ট কালেকশন ৬',
    price: 1100,
    imageUrl: '/product/WhatsApp Image 2026-08-15 at 6.14.32 PM (1).jpeg',
    category: 'নতুন কালেকশন',
    stockStatus: 'In Stock',
    callToOrder: '01942-838348'
  },
];

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const extractProductCode = (description?: string, title?: string): string => {
  try {
    if (description && (description.trim().startsWith('{') || description.trim().startsWith('['))) {
      const parsed = JSON.parse(description);
      if (parsed && typeof parsed === 'object' && parsed.product_code) {
        return parsed.product_code;
      }
    }
  } catch (e) {
    // ignore
  }

  // Fallback to title matching
  if (title) {
    const match = title.match(/\b(Y-\d+|W\d+|Y\d+|W-\d+)\b/i);
    if (match) {
      return match[1].toUpperCase();
    }
  }

  return '';
};

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return mockProducts; // Fallback
  }

  const dbProducts = data.map(p => {
    let slug = p.slug;
    if (!slug || slug === 'waterproof-bedsheet' || slug === 'reusable-diaper') {
      const code = extractProductCode(p.description, p.title);
      const base = generateSlug(p.title) || 'product';
      slug = code ? `${base}-${code.toLowerCase()}` : `${base}-${p.id}`;
    }
    return {
      id: p.id,
      slug: slug,
      title: p.title,
      price: p.price,
      originalPrice: p.original_price,
      imageUrl: p.image_url,
      galleryImages: p.gallery_images,
      description: p.description,
      category: p.category,
      stockStatus: p.stock_status,
      callToOrder: p.call_to_order,
      productCode: extractProductCode(p.description, p.title)
    };
  });

  const mockOnlyProducts = mockProducts.filter(mp => 
    !dbProducts.some(dbp => dbp.id === mp.id || dbp.slug === mp.slug)
  );

  return [...dbProducts, ...mockOnlyProducts];
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const decodedSlug = decodeURIComponent(slug).trim();

  // First attempt: fetch by exact slug
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', decodedSlug)
    .limit(1);

  if (!error && data && data.length > 0) {
    const item = data[0];
    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      price: item.price,
      originalPrice: item.original_price,
      imageUrl: item.image_url,
      galleryImages: item.gallery_images,
      description: item.description,
      category: item.category,
      stockStatus: item.stock_status,
      callToOrder: item.call_to_order,
      productCode: extractProductCode(item.description, item.title)
    };
  }

  // Second attempt: fetch all products and find matching slug
  const products = await getProducts();
  const found = products.find(p => p.slug === decodedSlug || p.slug.toLowerCase() === decodedSlug.toLowerCase());
  if (found) return found;

  // Third attempt: check if slug has embedded ID (e.g. product-55 or waterproof-bedsheet-22) or is numeric
  const matchId = decodedSlug.match(/-(\d+)$/) || decodedSlug.match(/^(\d+)$/);
  if (matchId) {
    const id = parseInt(matchId[1], 10);
    const product = await getProductById(id);
    if (product) return product;
  }

  console.error('Product not found for slug:', decodedSlug);
  return mockProducts.find(p => p.slug === decodedSlug);
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product by id:', error);
    return mockProducts.find(p => p.id === id);
  }

  return {
    id: data.id,
    slug: data.slug || generateSlug(data.title) || data.id.toString(),
    title: data.title,
    price: data.price,
    originalPrice: data.original_price,
    imageUrl: data.image_url,
    galleryImages: data.gallery_images,
    description: data.description,
    category: data.category,
    stockStatus: data.stock_status,
    callToOrder: data.call_to_order,
    productCode: extractProductCode(data.description, data.title)
  };
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const cleanCat = category
    .replace(/\u09af\u09bc/g, '\u09df') // য + nukta -> য়
    .replace(/\u09a1\u09bc/g, '\u09dc') // ড + nukta -> ড়
    .replace(/\u09a2\u09bc/g, '\u09dd'); // ঢ + nukta -> ঢ়
  const altCat = category
    .replace(/\u09df/g, '\u09af\u09bc')
    .replace(/\u09dc/g, '\u09a1\u09bc')
    .replace(/\u09dd/g, '\u09a2\u09bc');

  const categories = Array.from(new Set([
    category,
    cleanCat,
    altCat,
    category.normalize('NFC'),
    category.normalize('NFD'),
    cleanCat.normalize('NFC'),
    cleanCat.normalize('NFD'),
    altCat.normalize('NFC'),
    altCat.normalize('NFD')
  ]));

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('category', categories)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    return mockProducts.filter(p => p.category && categories.some(cat => p.category!.normalize('NFC') === cat.normalize('NFC')));
  }

  if (!data || data.length === 0) {
    return mockProducts.filter(p => p.category && categories.some(cat => p.category!.normalize('NFC') === cat.normalize('NFC')));
  }

  return data.map(p => ({
    id: p.id,
    slug: p.slug || generateSlug(p.title) || p.id.toString(),
    title: p.title,
    price: p.price,
    originalPrice: p.original_price,
    imageUrl: p.image_url,
    galleryImages: p.gallery_images,
    description: p.description,
    category: p.category,
    stockStatus: p.stock_status,
    callToOrder: p.call_to_order,
    productCode: extractProductCode(p.description, p.title)
  }));
}

export async function getRelatedProducts(currentId: number, limit: number = 4): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products.filter(p => p.id !== currentId).slice(0, limit);
  } catch (err) {
    console.error('Error in getRelatedProducts:', err);
    return mockProducts.filter(p => p.id !== currentId).slice(0, limit);
  }
}

export const getBaseTitle = (title: string): string => {
  return title
    .replace(/\s*\(6\/7\s*Feet\)/i, '')
    .replace(/\s*\(7\/8\s*Feet\)/i, '')
    .replace(/\s*\(৬\/৭\s*ফুট\)/i, '')
    .replace(/\s*\(৭\/৮\s*ফুট\)/i, '')
    .trim();
};

export const cleanTitle = (title: string, code?: string): string => {
  let cleaned = title;
  if (code) {
    const escapedCode = code.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\s*\\b${escapedCode}\\b\\s*`, 'i');
    cleaned = cleaned.replace(regex, ' ');
  }
  return cleaned
    .replace(/\s*\(6\/7\s*Feet\)/i, '')
    .replace(/\s*\(7\/8\s*Feet\)/i, '')
    .replace(/\s*\(৬\/৭\s*ফুট\)/i, '')
    .replace(/\s*\(৭\/৮\s*ফুট\)/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const groupProductsByBaseTitle = (products: Product[]): Product[] => {
  const seen = new Set<string>();
  const uniqueProducts: Product[] = [];

  for (const p of products) {
    const baseTitle = getBaseTitle(p.title);
    if (!seen.has(baseTitle)) {
      seen.add(baseTitle);
      
      // Find all products sharing this base title to get the lowest and highest price
      const variations = products.filter(item => getBaseTitle(item.title) === baseTitle);
      let lowestPrice = p.price;
      let highestPrice = p.price;
      let lowestOriginalPrice = p.originalPrice;
      
      if (variations.length > 1) {
        lowestPrice = Math.min(...variations.map(v => v.price));
        highestPrice = Math.max(...variations.map(v => v.price));
        // Find the variant with the lowest price to get its matching original price
        const cheapestVariant = variations.find(v => v.price === lowestPrice);
        if (cheapestVariant) {
          lowestOriginalPrice = cheapestVariant.originalPrice;
        }
      }

      uniqueProducts.push({
        ...p,
        title: baseTitle,
        price: lowestPrice,
        maxPrice: highestPrice > lowestPrice ? highestPrice : undefined,
        originalPrice: lowestOriginalPrice
      });
    }
  }

  return uniqueProducts;
};


