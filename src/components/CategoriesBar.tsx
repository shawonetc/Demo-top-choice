import React from 'react';
import styles from './CategoriesBar.module.css';

const categories = [
  { name: "নতুন কালেকশন", slug: "new-collection" },
  { name: "ওয়াটারপ্রুফ চাদর", slug: "waterproof-chador" },
  { name: "ডায়াপার", slug: "normal-chador" },
  { name: "মশারী", slug: "moshari" }
];

export default function CategoriesBar() {
  return null;
  /*
  return (
    <nav className={styles.nav}>
      <ul className={styles.categoryList}>
        {categories.map((category, index) => (
          <li key={index} className={styles.categoryItem}>
            <a href={`/category/${category.slug}`} className={styles.categoryLink}>{category.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
  */
}

