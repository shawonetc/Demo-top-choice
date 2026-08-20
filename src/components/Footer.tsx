"use client";
 
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Facebook01Icon,
  InstagramIcon,
  TiktokIcon,
  Location01Icon,
  CallIcon,
  WhatsappIcon,
  Mail01Icon
} from "@hugeicons/core-free-icons";
import styles from './Footer.module.css';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const settings = useSettings();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Column 1: Brand Info */}
        <div className={styles.column}>
          <div className={styles.logoWrapper}>
            <Image
              src={settings.logoUrlHeader}
              alt={`${settings.name} Logo`}
              width={75}
              height={75}
              priority
              className={styles.logoImage}
            />
            <span className={styles.logoText}>{settings.logoText}</span>
          </div>
          <p className={styles.description}>
            আমরা একটি বিশ্বস্ত আধুনিক ই-কমার্স প্ল্যাটফর্ম। আমাদের লক্ষ্য হলো সর্বোচ্চ গুণগত মান নিশ্চিত করে প্রিমিয়াম পণ্য আপনাদের দোরগোড়ায় সহজে পৌঁছে দেওয়া।
          </p>
          <div className={styles.socialRow}>
            {settings.social.facebook && (
              <a
                href={settings.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                aria-label="Facebook"
              >
                <HugeiconsIcon icon={Facebook01Icon} size={18} color="currentColor" />
              </a>
            )}
            {settings.social.tiktok && (
              <a
                href={settings.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                aria-label="TikTok"
              >
                <HugeiconsIcon icon={TiktokIcon} size={18} color="currentColor" />
              </a>
            )}
            {settings.social.instagram && (
              <a
                href={settings.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                aria-label="Instagram"
              >
                <HugeiconsIcon icon={InstagramIcon} size={18} color="currentColor" />
              </a>
            )}
          </div>
        </div>

        {/* Column 2: Customer Support */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>কাস্টমার সাপোর্ট</h3>
          <ul className={styles.linkList}>
            <li>
              <Link href="/track-order" className={styles.supportLink}>
                <span className={styles.bullet}>❖</span> অর্ডার ট্র্যাক করুন
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className={styles.supportLink}>
                শিপিং ও ডেলিভারি তথ্য
              </Link>
            </li>
            <li>
              <Link href="/return-policy" className={styles.supportLink}>
                রিটার্ন এবং রিফান্ড পলিসি
              </Link>
            </li>
            <li>
              <Link href="/terms" className={styles.supportLink}>
                শর্তাবলী ও নিয়মাবলী
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>যোগাযোগ করুন</h3>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <div className={styles.iconContainer}>
                <HugeiconsIcon icon={Location01Icon} size={18} color="currentColor" />
              </div>
              <span className={styles.contactText}>{settings.contact.address}</span>
            </li>
            <li className={styles.contactItem}>
              <div className={styles.iconContainer}>
                <HugeiconsIcon icon={CallIcon} size={18} color="currentColor" />
              </div>
              <a href={`tel:${settings.contact.phoneDigits}`} className={styles.contactLink}>{settings.contact.phone}</a>
            </li>
            <li className={styles.contactItem}>
              <div className={styles.iconContainer}>
                <HugeiconsIcon icon={WhatsappIcon} size={18} color="currentColor" />
              </div>
              <a href={`https://wa.me/${settings.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>{settings.contact.phone}</a>
            </li>
            <li className={styles.contactItem}>
              <div className={styles.iconContainer}>
                <HugeiconsIcon icon={Mail01Icon} size={18} color="currentColor" />
              </div>
              <a href={`mailto:${settings.contact.email}`} className={styles.contactLink}>{settings.contact.email}</a>
            </li>
          </ul>
        </div>

      </div>

      {/* Clean Bottom Copyright Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomBarContent}>
          <p>&copy; {new Date().getFullYear()} {settings.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
