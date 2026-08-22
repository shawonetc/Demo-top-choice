'use client';

import React from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  HugeiconsIcon
} from '@hugeicons/react';
import {
  Add01Icon,
  PencilEdit01Icon,
  Delete02Icon,
  Search01Icon,
  FilterIcon,
  MoreHorizontalIcon
} from '@hugeicons/core-free-icons';
import styles from '../Admin.module.css';
import { getProducts, Product } from '../../../data/products';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../../lib/supabase';
import { TableRowSkeleton } from '../../../components/admin/Skeleton';


const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All Categories');
  const [stockFilter, setStockFilter] = React.useState('Stock Status');

  const fetchProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const parsedProducts = React.useMemo(() => {
    return products.map(p => {
      let sizesCount = 1;
      let priceRange = `৳${p.price}`;

      try {
        if (p.description && (p.description.trim().startsWith('{') || p.description.trim().startsWith('['))) {
          const parsed = JSON.parse(p.description);
          if (parsed && typeof parsed === 'object' && parsed.sizes) {
            const sizes = parsed.sizes;
            const activeSizes = Object.keys(sizes).filter(key => sizes[key] && sizes[key].enabled);
            
            if (activeSizes.length > 0) {
              sizesCount = activeSizes.length;
              const prices = activeSizes.map(key => sizes[key].price);
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              
              priceRange = minPrice === maxPrice 
                ? `৳${minPrice}` 
                : `৳${minPrice} - ৳${maxPrice}`;
            }
          }
        }
      } catch (e) {
        console.error('Error parsing product sizes in admin list:', e);
      }

      return {
        ...p,
        sizesCount,
        priceRange
      };
    });
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    const normalizeBengali = (str: string) => {
      if (!str) return '';
      return str
        .replace(/\u09af\u09bc/g, '\u09df') // য + nukta -> য়
        .replace(/\u09a1\u09bc/g, '\u09dc') // ড + nukta -> ড়
        .replace(/\u09a2\u09bc/g, '\u09dd'); // ঢ + nukta -> ঢ়
    };

    return parsedProducts.filter(product => {
      // Search filter
      const search = searchQuery.toLowerCase().trim();
      const matchesSearch = search === '' ||
        product.title.toLowerCase().includes(search) ||
        (product.productCode && product.productCode.toLowerCase().includes(search));

      // Category filter
      let matchesCategory = true;
      if (categoryFilter !== 'All Categories') {
        const normFilter = normalizeBengali(categoryFilter);
        const normProdCat = normalizeBengali(product.category || '');
        matchesCategory = normProdCat === normFilter;
      }

      // Stock status filter
      let matchesStock = true;
      if (stockFilter !== 'Stock Status') {
        const filterVal = stockFilter.toLowerCase().replace(/\s+/g, '');
        const prodVal = product.stockStatus.toLowerCase().replace(/\s+/g, '');
        matchesStock = (filterVal === 'instock' && prodVal === 'instock') ||
                      (filterVal === 'outofstock' && prodVal === 'outofstock');
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [parsedProducts, searchQuery, categoryFilter, stockFilter]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Error deleting product');
      } else {
        // Trigger cache revalidation
        try {
          await fetch('/api/revalidate');
        } catch (revalErr) {
          console.error('Failed to trigger revalidation:', revalErr);
        }
        fetchProducts();
      }
    }
  };

  return (
    <AdminLayout>
      <div className={styles.sectionHeader}>
        <div>
          <h1 className={styles.pageTitle}>Products Management</h1>
          <p className={styles.pageSubtitle}>Manage your inventory, prices, and product details.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/products/add" className={styles.primaryBtn}>
            <HugeiconsIcon icon={Add01Icon} size={20} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchContainer}>
          <HugeiconsIcon icon={Search01Icon} size={18} color="var(--text-light)" />
          <input
            type="text"
            placeholder="Search products by name, SKU..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <select 
            className={styles.select}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All Categories">All Categories</option>
            <option value="ওয়াটারপ্রুফ চাদর">ওয়াটারপ্রুফ চাদর</option>
            <option value="ডায়াপার">ডায়াপার</option>
            <option value="মশারী">মশারী</option>
          </select>
          <select 
            className={styles.select}
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="Stock Status">Stock Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.productsTableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRowSkeleton key={i} columns={6} />
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className={styles.productInfoCell}>
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          width={40}
                          height={40}
                          className={styles.productThumb}
                        />
                        <span className={styles.productName}>
                          {product.title}
                          {product.sizesCount > 1 && (
                            <span style={{ 
                              marginLeft: '8px', 
                              padding: '2px 6px', 
                              fontSize: '11px', 
                              background: 'rgba(255, 90, 0, 0.1)', 
                              color: 'var(--primary-color)', 
                              borderRadius: '4px', 
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap'
                            }}>
                              {product.sizesCount} Sizes
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td>{product.category || 'N/A'}</td>
                    <td>{product.priceRange}</td>
                    <td>124</td>
                    <td>
                      <span className={`${styles.status} ${product.stockStatus === 'In Stock' ? styles.statusSuccess : styles.statusPending}`}>
                        {product.stockStatus}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <Link href={`/admin/products/edit?id=${product.id}`} className={`${styles.actionBtn} ${styles.editBtn}`} title="Edit">
                          <HugeiconsIcon icon={PencilEdit01Icon} size={18} />
                        </Link>
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title="Delete"
                          onClick={() => handleDelete(product.id)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No products found.</td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--text-gray)', fontSize: '14px' }}>
            Showing 1 to {filteredProducts.length} of {filteredProducts.length} entries
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={styles.select} disabled>Previous</button>
            <button className={styles.select} style={{ backgroundColor: 'var(--primary-color)', color: 'white', borderColor: 'var(--primary-color)' }}>1</button>
            <button className={styles.select}>Next</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;
