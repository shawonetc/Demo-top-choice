"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoreSettings, StoreSettings } from '../lib/settings';
import { siteConfig } from '../lib/config';

// Create a combined default state that includes logo Url fallbacks
const defaultSettings: StoreSettings = {
  ...siteConfig,
  logoText: 'Top Choice',
  logoTextShort: 'Top Choice',
  logoUrl: '/logo22.png',
  logoUrlHeader: '/logo22.png'
};

const SettingsContext = createContext<StoreSettings>(defaultSettings);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);

  useEffect(() => {
    getStoreSettings().then((res) => {
      if (res) {
        setSettings(res);
      }
    });
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
