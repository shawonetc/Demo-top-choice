'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Settings02Icon,
  Store01Icon,
  Shield01Icon,
  Notification01Icon,
  GlobalIcon,
  Tick02Icon,
  Mail01Icon,
  CallIcon,
  Location01Icon,
  CreditCardIcon,
  Key01Icon,
  UserIcon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';
import styles from '../Admin.module.css';
import { supabase } from '../../../lib/supabase';

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  const [settings, setSettings] = useState({
    storeName: '',
    tagline: '',
    description: '',
    url: '',
    logoText: '',
    logoTextShort: '',
    primaryColor: '',
    primaryHover: '',
    storeEmail: '',
    storePhone: '',
    storePhoneDigits: '',
    storeWhatsapp: '',
    storeAddress: '',
    logoUrl: '',
    logoUrlHeader: '',
    facebookUrl: '',
    tiktokUrl: '',
    instagramUrl: '',
    currency: 'BDT',
    maintenanceMode: false,
    orderNotifications: true,
    stockNotifications: true,
  });

  const [logoUploading, setLogoUploading] = useState(false);
  const [headerLogoUploading, setHeaderLogoUploading] = useState(false);

  // Fetch settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setFetching(true);
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (error) {
          console.error('Error fetching settings:', error.message);
        } else if (data) {
          setSettings({
            storeName: data.store_name || '',
            tagline: data.tagline || '',
            description: data.description || '',
            url: data.url || '',
            logoText: data.logo_text || '',
            logoTextShort: data.logo_text_short || '',
            logoUrl: data.logo_url || '/images/logo.png',
            logoUrlHeader: data.logo_url_header || '/images/logo1.png',
            primaryColor: data.primary_color || '',
            primaryHover: data.primary_hover || '',
            storeEmail: data.email || '',
            storePhone: data.phone || '',
            storePhoneDigits: data.phone_digits || '',
            storeWhatsapp: data.whatsapp || '',
            storeAddress: data.address || '',
            facebookUrl: data.facebook_url || '',
            tiktokUrl: data.tiktok_url || '',
            instagramUrl: data.instagram_url || '',
            currency: 'BDT',
            maintenanceMode: false,
            orderNotifications: true,
            stockNotifications: true,
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>, isHeader: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isHeader) {
      setHeaderLogoUploading(true);
    } else {
      setLogoUploading(true);
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      if (isHeader) {
        setSettings(prev => ({ ...prev, logoUrlHeader: publicUrl }));
      } else {
        setSettings(prev => ({ ...prev, logoUrl: publicUrl }));
      }
      alert('Logo uploaded successfully!');
    } catch (err: any) {
      alert(`Error uploading logo: ${err.message}`);
    } finally {
      if (isHeader) {
        setHeaderLogoUploading(false);
      } else {
        setLogoUploading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          id: 1,
          store_name: settings.storeName,
          tagline: settings.tagline,
          description: settings.description,
          url: settings.url,
          logo_text: settings.logoText,
          logo_text_short: settings.logoTextShort,
          logo_url: settings.logoUrl,
          logo_url_header: settings.logoUrlHeader,
          primary_color: settings.primaryColor,
          primary_hover: settings.primaryHover,
          email: settings.storeEmail,
          phone: settings.storePhone,
          phone_digits: settings.storePhoneDigits,
          whatsapp: settings.storeWhatsapp,
          address: settings.storeAddress,
          facebook_url: settings.facebookUrl,
          tiktok_url: settings.tiktokUrl,
          instagram_url: settings.instagramUrl,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Settings updated successfully in database!');
    } catch (err: any) {
      alert(`Error updating settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General & Profile', icon: Store01Icon },
    // { id: 'branding', name: 'Branding & Socials', icon: Settings02Icon },
    { id: 'security', name: 'Security', icon: Shield01Icon },
    { id: 'notifications', name: 'Notifications', icon: Notification01Icon },
  ];

  if (fetching) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div className={styles.loader}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.sectionHeader}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Configure your store preferences, branding options, and metadata.</p>
        </div>
        <button className={styles.primaryBtn} onClick={handleSave} disabled={loading}>
          {loading ? (
            <div className={styles.loader} style={{ width: '18px', height: '18px', borderTopColor: 'white' }}></div>
          ) : (
            <HugeiconsIcon icon={Tick02Icon} size={18} />
          )}
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className={styles.settingsLayout}>
        {/* Settings Sidebar */}
        <div className={styles.settingsSidebar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.settingsTab} ${isActive ? styles.settingsTabActive : ''}`}
              >
                <HugeiconsIcon 
                  icon={tab.icon} 
                  size={20} 
                />
                <span style={{ flex: 1 }}>{tab.name}</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} style={{ opacity: isActive ? 1 : 0 }} />
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className={styles.settingsContent}>
          {activeTab === 'general' && (
            <>
              <div className={styles.settingsCard}>
                <div className={styles.settingsCardHeader}>
                  <h3 className={styles.settingsCardTitle}>Store Profile</h3>
                  <p className={styles.settingsCardSubtitle}>Public contact information for your store.</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Store Name</label>
                    <div className={styles.inputWrapper}>
                      <HugeiconsIcon icon={Store01Icon} size={18} className={styles.inputIcon} />
                      <input
                        type="text"
                        className={`${styles.input} ${styles.inputWithIcon}`}
                        value={settings.storeName}
                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Store Email</label>
                    <div className={styles.inputWrapper}>
                      <HugeiconsIcon icon={Mail01Icon} size={18} className={styles.inputIcon} />
                      <input
                        type="email"
                        className={`${styles.input} ${styles.inputWithIcon}`}
                        value={settings.storeEmail}
                        onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Contact Phone (Display)</label>
                    <div className={styles.inputWrapper}>
                      <HugeiconsIcon icon={CallIcon} size={18} className={styles.inputIcon} />
                      <input
                        type="text"
                        className={`${styles.input} ${styles.inputWithIcon}`}
                        value={settings.storePhone}
                        onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Contact Phone Digits (Links)</label>
                    <div className={styles.inputWrapper}>
                      <HugeiconsIcon icon={CallIcon} size={18} className={styles.inputIcon} />
                      <input
                        type="text"
                        className={`${styles.input} ${styles.inputWithIcon}`}
                        value={settings.storePhoneDigits}
                        onChange={(e) => setSettings({ ...settings, storePhoneDigits: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.formLabel}>Store Location Address</label>
                    <div className={styles.inputWrapper}>
                      <HugeiconsIcon icon={Location01Icon} size={18} className={styles.inputIcon} />
                      <input
                        type="text"
                        className={`${styles.input} ${styles.inputWithIcon}`}
                        value={settings.storeAddress}
                        onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* {activeTab === 'branding' && (
            <>
              <div className={styles.settingsCard}>
                <div className={styles.settingsCardHeader}>
                  <h3 className={styles.settingsCardTitle}>SEO & Branding Metadata</h3>
                  <p className={styles.settingsCardSubtitle}>Configure metadata tags, taglines, and color values.</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tagline</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Domain URL</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={settings.url}
                      onChange={(e) => setSettings({ ...settings, url: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Logo Text (Full)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={settings.logoText}
                      onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Logo Text (Short)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={settings.logoTextShort}
                      onChange={(e) => setSettings({ ...settings, logoTextShort: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Primary Theme Color</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="#ff5a00"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Primary Color Hover</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="#e04f00"
                      value={settings.primaryHover}
                      onChange={(e) => setSettings({ ...settings, primaryHover: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Primary Logo (Sidebar/Login)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadLogo(e, false)}
                        style={{ display: 'none' }}
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload" className={styles.secondaryBtn} style={{ cursor: 'pointer', margin: 0, padding: '8px 16px', fontSize: '14px' }}>
                        {logoUploading ? 'Uploading...' : 'Choose File'}
                      </label>
                      {settings.logoUrl && (
                        <img src={settings.logoUrl} alt="Logo Preview" style={{ height: '36px', maxWidth: '100px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd', padding: '2px' }} />
                      )}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Header/Footer Logo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadLogo(e, true)}
                        style={{ display: 'none' }}
                        id="header-logo-upload"
                      />
                      <label htmlFor="header-logo-upload" className={styles.secondaryBtn} style={{ cursor: 'pointer', margin: 0, padding: '8px 16px', fontSize: '14px' }}>
                        {headerLogoUploading ? 'Uploading...' : 'Choose File'}
                      </label>
                      {settings.logoUrlHeader && (
                        <img src={settings.logoUrlHeader} alt="Header Logo Preview" style={{ height: '36px', maxWidth: '100px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd', padding: '2px' }} />
                      )}
                    </div>
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.formLabel}>Meta Description</label>
                    <textarea
                      className={styles.input}
                      style={{ minHeight: '80px', padding: '12px', resize: 'vertical' }}
                      value={settings.description}
                      onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.settingsCard}>
                <div className={styles.settingsCardHeader}>
                  <h3 className={styles.settingsCardTitle}>Social Links & Channels</h3>
                  <p className={styles.settingsCardSubtitle}>Manage channels and float numbers.</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>WhatsApp Number (Digits only)</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="8801887245556"
                      value={settings.storeWhatsapp}
                      onChange={(e) => setSettings({ ...settings, storeWhatsapp: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Facebook URL</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={settings.facebookUrl}
                      onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>TikTok URL</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={settings.tiktokUrl}
                      onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Instagram URL</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={settings.instagramUrl}
                      onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </>
          )} */}

          {activeTab === 'security' && (
            <div className={styles.settingsCard}>
              <div className={styles.settingsCardHeader}>
                <h3 className={styles.settingsCardTitle}>Authentication Security</h3>
                <p className={styles.settingsCardSubtitle}>Manage your administrative access and passwords.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '480px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Current Password</label>
                  <div className={styles.inputWrapper}>
                    <HugeiconsIcon icon={Key01Icon} size={18} className={styles.inputIcon} />
                    <input type="password" className={`${styles.input} ${styles.inputWithIcon}`} placeholder="••••••••" />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>New Password</label>
                  <div className={styles.inputWrapper}>
                    <HugeiconsIcon icon={Key01Icon} size={18} className={styles.inputIcon} />
                    <input type="password" className={`${styles.input} ${styles.inputWithIcon}`} placeholder="••••••••" />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Confirm New Password</label>
                  <div className={styles.inputWrapper}>
                    <HugeiconsIcon icon={Shield01Icon} size={18} className={styles.inputIcon} />
                    <input type="password" className={`${styles.input} ${styles.inputWithIcon}`} placeholder="••••••••" />
                  </div>
                </div>
                <button className={styles.secondaryBtn} style={{ width: 'fit-content', padding: '12px 24px' }}>
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className={styles.settingsCard}>
              <div className={styles.settingsCardHeader}>
                <h3 className={styles.settingsCardTitle}>System Notifications</h3>
                <p className={styles.settingsCardSubtitle}>Choose how you want to be notified about store events.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { id: 'orderNotifications', label: 'Order Notifications', desc: 'Receive instant alerts when a new order is placed.' },
                  { id: 'stockNotifications', label: 'Low Stock Alerts', desc: 'Be notified when product quantity drops below threshold.' }
                ].map((item) => (
                  <div key={item.id} className={styles.settingItem}>
                    <div className={styles.settingItemInfo}>
                      <span className={styles.settingItemLabel}>{item.label}</span>
                      <span className={styles.settingItemDesc}>{item.desc}</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={(settings as any)[item.id]}
                        onChange={(e) => setSettings({ ...settings, [item.id]: e.target.checked })}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
