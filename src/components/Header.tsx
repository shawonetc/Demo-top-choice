"use client";

import React from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingCart01Icon, Search01Icon, Cancel01Icon, Menu02Icon } from "@hugeicons/core-free-icons";
import styles from './Header.module.css';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSettings } from '../context/SettingsContext';

export default function Header() {
  const { cartItems } = useCart();
  const settings = useSettings();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();

  const categories = [
    { name: "নতুন কালেকশন", slug: "new-collection" },
    { name: "ওয়াটারপ্রুফ চাদর", slug: "waterproof-chador" },
    { name: "ডায়াপার", slug: "normal-chador" },
    { name: "মশারী", slug: "moshari" },
    { name: "Premium Quality Shirt", slug: "premium-shirt" }
  ];

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.marquee}>
          <div className={styles.marqueeContent}>
            <span>১০০% আসল পণ্য - দ্রুত ডেলিভারি - গ্রাহক-বান্ধব সেবা</span>
            <span>১০০% আসল পণ্য - দ্রুত ডেলিভারি - গ্রাহক-বান্ধব সেবা</span>
          </div>
        </div>
      </div>
      <div className={styles.mainHeader}>
        <div className={styles.headerLeft}>
          <button
            className={styles.menuButton}
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open Menu"
          >
            <HugeiconsIcon icon={Menu02Icon} size={24} color="currentColor" strokeWidth={2} />
          </button>
        </div>

        <div className={styles.logo}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src="/logo.jpeg"
              alt={`${settings.name} Logo`}
              width={32}
              height={32}
              priority
              className={styles.logoIcon}
            />
            <span className={styles.logoText}>{settings.logoText}</span>
          </Link>
        </div>

        <form
          className={`${styles.searchContainer} ${isSearchOpen ? styles.showSearch : ''}`}
          onSubmit={handleSearch}
        >
          <input
            type="text"
            placeholder="Search for products..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchButton} aria-label="Search">
            <HugeiconsIcon icon={Search01Icon} size={20} color="currentColor" strokeWidth={2} />
          </button>
        </form>

        <div className={styles.headerActions}>
          <button
            className={styles.searchIconButton}
            onClick={toggleSearch}
            aria-label="Toggle Search"
          >
            <HugeiconsIcon
              icon={isSearchOpen ? Cancel01Icon : Search01Icon}
              size={24}
              color="currentColor"
              strokeWidth={1.5}
            />
          </button>
          <Link href="/cart" className={styles.cartContainer}>
            <div className={styles.cartIcon}>
              <HugeiconsIcon icon={ShoppingCart01Icon} size={28} color="currentColor" strokeWidth={1.5} />
            </div>
            <span className={styles.cartBadge}>{cartCount}</span>
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <div className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.menuOpen : ''}`} onClick={() => setIsMenuOpen(false)}>
        <div className={styles.mobileSidebar} onClick={(e) => e.stopPropagation()}>
          <div className={styles.sidebarHeader}>
            <h3>Categories</h3>
            <button className={styles.closeButton} onClick={() => setIsMenuOpen(false)}>
              <HugeiconsIcon icon={Cancel01Icon} size={24} color="currentColor" strokeWidth={1.5} />
            </button>
          </div>
          <nav className={styles.sidebarNav}>
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/category/${category.slug}`}
                className={styles.sidebarLink}
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
