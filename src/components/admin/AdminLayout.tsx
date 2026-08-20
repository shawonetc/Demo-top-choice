'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import styles from '../../app/admin/Admin.module.css';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Skeleton, { StatCardSkeleton } from './Skeleton';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
      } else {
        setLoading(false);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  if (loading) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <Skeleton width={40} height={40} borderRadius={12} className={styles.skeletonDark} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Skeleton width={100} height={18} className={styles.skeletonDark} />
              <Skeleton width={60} height={10} className={styles.skeletonDark} />
            </div>
          </div>
          <div className={styles.sidebarNav}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ padding: '12px 24px' }}>
                <Skeleton width="100%" height={32} borderRadius={10} className={styles.skeletonDark} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', padding: '24px' }}>
            <Skeleton width="100%" height={60} borderRadius={12} className={styles.skeletonDark} />
          </div>
        </div>
        <main className={styles.mainContent}>
          <div className={styles.navbar}>
            <Skeleton width={200} height={32} />
            <div className={styles.navbarActions}>
              <Skeleton width={36} height={36} circle />
              <Skeleton width={36} height={36} circle />
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Skeleton width={36} height={36} circle />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Skeleton width={80} height={12} />
                  <Skeleton width={60} height={10} />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <div className={styles.pageHeader}>
              <Skeleton width={300} height={36} style={{ marginBottom: '8px' }} />
              <Skeleton width={500} height={20} />
            </div>
            <div className={styles.statsGrid}>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
            <div className={styles.section}>
              <Skeleton width="100%" height={400} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>

      <div 
        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.showOverlay : ''}`}
        onClick={closeSidebar}
      />
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <main className={styles.mainContent}>
        <AdminNavbar onMenuClick={toggleSidebar} />
        <div className={styles.contentWrapper}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
