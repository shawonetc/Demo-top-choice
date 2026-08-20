"use client";
 
import React, { ReactNode } from 'react';
import { CartProvider } from '../context/CartContext';
import { SettingsProvider } from '../context/SettingsContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <CartProvider>{children}</CartProvider>
    </SettingsProvider>
  );
}
