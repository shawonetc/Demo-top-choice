import React from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import CategoriesBar from '../../../components/CategoriesBar';
import ProductGrid from '../../../components/ProductGrid';
import { getProductsByCategory } from '../../../data/products';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

const categoryMap: Record<string, string> = {
  "new-collection": "নতুন কালেকশন",
  "waterproof-chador": "ওয়াটারপ্রুফ চাদর",
  "normal-chador": "ডায়াপার",
  "diaper": "ডায়াপার",
  "moshari": "মশারী",
  "premium-shirt": "Premium Quality Shirt"
};

// এই slug গুলোতে extra categories-ও মিলিয়ে দেখাবে
const extraCategoryMap: Record<string, string[]> = {
  "normal-chador": ["নরমাল চাদর"],
  "diaper": ["নরমাল চাদর"],
};

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const categoryName = categoryMap[resolvedParams.slug];

  if (!categoryName) {
    notFound();
  }

  const products = await getProductsByCategory(categoryName);

  // Extra categories (যেমন ডায়াপার → নরমাল চাদরে দেখাবে)
  const extras = extraCategoryMap[resolvedParams.slug] || [];
  const extraProducts = await Promise.all(extras.map(cat => getProductsByCategory(cat)));
  const allProducts = [...products, ...extraProducts.flat()];

  return (
    <>
      <Header />
      <CategoriesBar />
      <main style={{ padding: '20px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <ProductGrid title={`${categoryName}`} products={allProducts} showAll={true} />

          {allProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
              <p>No products found in this category.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
