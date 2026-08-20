import Header from '../components/Header';
import CategoriesBar from '../components/CategoriesBar';
import HeroBanner from '../components/HeroBanner';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { getProducts } from '../data/products';

const mockDiaperProducts = [
  { id: 101, slug: 'diaper-5pcs', title: '৫ পিস রি-ইউজেবল ডায়াপার', price: 950, imageUrl: '/images/products/diaper1.png', stockStatus: 'In Stock' as const },
  { id: 102, slug: 'diaper-4pcs', title: '৪ পিস রি-ইউজেবল ডায়াপার', price: 850, imageUrl: '/images/products/diaper2.png', stockStatus: 'In Stock' as const },
  { id: 103, slug: 'diaper-3pcs', title: '৩ পিস রি-ইউজেবল ডায়াপার', price: 550, imageUrl: '/images/products/diaper3.png', stockStatus: 'In Stock' as const },
  { id: 104, slug: 'diaper-2pcs', title: '২ পিস রি-ইউজেবল ডায়াপার', price: 450, imageUrl: '/images/products/diaper4.png', stockStatus: 'In Stock' as const },
];

export default async function Home() {
  const products = await getProducts();

  const diaperProductsFromDB = products.filter(p => p.category && p.category.normalize('NFC') === 'ডায়াপার'.normalize('NFC'))
    .sort((a, b) => b.price - a.price);

  // Supabase-এ ডায়াপার না থাকলে mock data ব্যবহার করো
  const diaperProducts = diaperProductsFromDB.length > 0 ? diaperProductsFromDB : mockDiaperProducts;

  const diaperProductsFormatted = diaperProducts.map((p, index) => ({
    ...p,
    id: typeof p.id === 'string' ? 1000 + index : p.id
  }));

  const waterproofProducts = products.filter(p => p.category === 'ওয়াটারপ্রুফ চাদর');
  const newCollectionProducts = products.filter(p => p.category === 'নতুন কালেকশন');

  return (
    <>
      <Header />
      <CategoriesBar />
      <main>
        <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: '0' }}>
          Nittonotonbd - Best Online Shopping in Bangladesh for Electronics &amp; Lifestyle
        </h1>
        <HeroBanner />
        <ProductGrid 
          title="নতুন কালেকশন" 
          products={newCollectionProducts} 
          showSeeMore={true} 
          seeMoreUrl="/category/new-collection"
          disablePagination={true}
        />
        <ProductGrid 
          title="Waterproof Bedsheet" 
          products={waterproofProducts} 
          showSeeMore={true} 
          seeMoreUrl="/category/waterproof-chador"
          disablePagination={true}
        />
        <ProductGrid 
          title="রি-ইউজেবল ডায়াপার" 
          products={diaperProductsFormatted} 
          showSeeMore={true} 
          seeMoreUrl="/category/normal-chador"
          disablePagination={true}
        />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
