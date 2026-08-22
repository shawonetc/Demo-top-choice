import Header from '../components/Header';
import CategoriesBar from '../components/CategoriesBar';
import HeroBanner from '../components/HeroBanner';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { getProducts } from '../data/products';

export default async function Home() {
  const products = await getProducts();

  const newCollectionProducts = products.filter(p => p.category === 'নতুন কালেকশন');
  const premiumShirtProducts = products.filter(p => p.category === 'Premium Quality Shirt');

  return (
    <>
      <Header />
      <CategoriesBar />
      <main>
        <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: '0' }}>
          Top Choice - Best Online Shop for Premium &amp; Stylish T-Shirts in Bangladesh
        </h1>
        <HeroBanner />
        <ProductGrid
          title="Premium Quality Shirt"
          products={premiumShirtProducts}
          showSeeMore={true}
          seeMoreUrl="/category/premium-shirt"
          disablePagination={true}
        />
        <ProductGrid
          title="নতুন কালেকশন"
          products={newCollectionProducts}
          showSeeMore={true}
          seeMoreUrl="/category/new-collection"
          disablePagination={true}
        />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
