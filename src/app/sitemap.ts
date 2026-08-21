import { MetadataRoute } from 'next';
import { getProducts } from '../data/products';
import { siteConfig } from '../lib/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Fetch all products to generate dynamic sitemap entries
  let products: any[] = [];
  try {
    products = await getProducts();
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  const productEntries = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Dynamic category list
  const categories = ['new-collection', 'waterproof-chador', 'normal-chador', 'moshari'];
  const categoryEntries = categories.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Static pages
  const staticPages = [
    '',
    '/products',
    '/cart',
    '/checkout',
    '/about',
    '/privacy-policy',
    '/return-policy',
    '/shipping-policy',
    '/terms',
  ];

  const staticEntries = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/products' ? ('daily' as const) : ('monthly' as const),
    priority: path === '' ? 1.0 : path === '/products' ? 0.9 : 0.5,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
