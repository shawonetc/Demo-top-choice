"use client";

import React from 'react';
import { HugeiconsIcon } from "@hugeicons/react";
import { WhatsappIcon } from "@hugeicons/core-free-icons";
import styles from './WhatsAppButton.module.css';
import { siteConfig } from '../lib/config';

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${siteConfig.contact.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.whatsappFloat}
      aria-label="Contact us on WhatsApp"
    >
      <div className={styles.pulse}></div>
      <div className={styles.iconWrapper}>
        <HugeiconsIcon icon={WhatsappIcon} size={28} color="white" />
      </div>
      <span className={styles.tooltip}>হোয়াটসঅ্যাপে যোগাযোগ করুন</span>
    </a>
  );
}
