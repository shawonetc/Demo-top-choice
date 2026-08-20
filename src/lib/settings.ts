import { supabase } from './supabase';
import { siteConfig } from './config';

export interface StoreSettings {
  name: string;
  tagline: string;
  description: string;
  url: string;
  logoText: string;
  logoTextShort: string;
  logoUrl: string;
  logoUrlHeader: string;
  primaryColor: string;
  primaryHover: string;
  contact: {
    phone: string;
    phoneDigits: string;
    whatsapp: string;
    email: string;
    address: string;
  };
  social: {
    facebook: string;
    tiktok: string;
    instagram: string;
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      return {
        ...siteConfig,
        logoText: 'Top Choice',
        logoTextShort: 'Top Choice',
        logoUrl: '/logo22.png',
        logoUrlHeader: '/logo22.png'
      };
    }

    return {
      name: data.store_name,
      tagline: data.tagline,
      description: data.description,
      url: data.url,
      logoText: 'Top Choice',
      logoTextShort: 'Top Choice',
      logoUrl: '/logo22.png',
      logoUrlHeader: '/logo22.png',
      primaryColor: data.primary_color,
      primaryHover: data.primary_hover,
      contact: {
        phone: data.phone,
        phoneDigits: data.phone_digits,
        whatsapp: data.whatsapp,
        email: data.email,
        address: data.address,
      },
      social: {
        facebook: data.facebook_url,
        tiktok: data.tiktok_url,
        instagram: data.instagram_url,
      }
    };
  } catch (e) {
    return {
      ...siteConfig,
      logoText: 'Top Choice',
      logoTextShort: 'Top Choice',
      logoUrl: '/logo22.png',
      logoUrlHeader: '/logo22.png'
    };
  }
}
