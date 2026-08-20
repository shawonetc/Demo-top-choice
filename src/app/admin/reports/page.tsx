'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import StatCard from '../../../components/admin/StatCard';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ChartLineData01Icon,
  Download01Icon,
  Calendar01Icon,
  Dollar01Icon,
  ShoppingBag01Icon,
  UserGroupIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  InformationCircleIcon
} from '@hugeicons/core-free-icons';
import styles from '../Admin.module.css';
import { supabase } from '../../../lib/supabase';
import { StatCardSkeleton } from '../../../components/admin/Skeleton';
import SalesAnalytics from '../../../components/admin/SalesAnalytics';
import { siteConfig } from '../../../lib/config';

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    customerGrowth: 0,
    revenueTrend: 0,
    ordersTrend: 0,
    aovTrend: 0
  });

  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [last12Months, setLast12Months] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);

  const normalizeCategory = (cat: string) => {
    if (!cat) return 'Uncategorized';
    const c = cat.trim();
    if (c.includes('চাদর')) return 'ওয়াটারপ্রুফ চাদর';
    if (c.includes('ডায়াপার') || c.includes('ডায়াপার')) return 'ডায়াপার';
    if (c.includes('মশারী') || c.includes('মশারি')) return 'মশারী';
    return c;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch orders
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, total, status, created_at');

        if (ordersError) throw ordersError;

        // 2. Fetch profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, created_at');

        if (profilesError) throw profilesError;

        // 3. Fetch order items
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('order_id, product_id, product_title, quantity, price');

        if (itemsError) throw itemsError;

        // 4. Fetch products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, title, category');

        if (productsError) throw productsError;

        const allOrders = orders || [];
        const allProfiles = profiles || [];
        const allOrderItems = orderItems || [];
        const allProducts = products || [];

        // Define periods for trend analysis (Last 30 Days vs 30-60 Days ago)
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(now.getDate() - 60);

        const periodAOrders = allOrders.filter(o => new Date(o.created_at) >= thirtyDaysAgo);
        const periodBOrders = allOrders.filter(o => {
          const d = new Date(o.created_at);
          return d >= sixtyDaysAgo && d < thirtyDaysAgo;
        });

        // Period A Metrics
        const totalRevenueA = periodAOrders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? o.total : 0), 0);
        const totalOrdersA = periodAOrders.length;
        const avgOrderValueA = totalOrdersA > 0 ? totalRevenueA / totalOrdersA : 0;

        // Period B Metrics
        const totalRevenueB = periodBOrders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? o.total : 0), 0);
        const totalOrdersB = periodBOrders.length;
        const avgOrderValueB = totalOrdersB > 0 ? totalRevenueB / totalOrdersB : 0;

        // Trends
        let revenueTrend = 0;
        if (totalRevenueB > 0) {
          revenueTrend = ((totalRevenueA - totalRevenueB) / totalRevenueB) * 100;
        } else if (totalRevenueA > 0) {
          revenueTrend = 100;
        }

        let ordersTrend = 0;
        if (totalOrdersB > 0) {
          ordersTrend = ((totalOrdersA - totalOrdersB) / totalOrdersB) * 100;
        } else if (totalOrdersA > 0) {
          ordersTrend = 100;
        }

        let aovTrend = 0;
        if (avgOrderValueB > 0) {
          aovTrend = ((avgOrderValueA - avgOrderValueB) / avgOrderValueB) * 100;
        } else if (avgOrderValueA > 0) {
          aovTrend = 100;
        }

        // Customers Count and Growth
        const totalCustomersVal = allProfiles.length;
        const profilesBefore30Days = allProfiles.filter(p => new Date(p.created_at) < thirtyDaysAgo).length;
        let customerGrowthVal = 0;
        if (profilesBefore30Days > 0) {
          customerGrowthVal = ((totalCustomersVal - profilesBefore30Days) / profilesBefore30Days) * 100;
        } else if (totalCustomersVal > 0) {
          customerGrowthVal = 100;
        }

        setStats({
          totalRevenue: totalRevenueA,
          totalOrders: totalOrdersA,
          avgOrderValue: avgOrderValueA,
          totalCustomers: totalCustomersVal,
          customerGrowth: customerGrowthVal,
          revenueTrend,
          ordersTrend,
          aovTrend
        });

        // 5. Generate Last 12 Months revenue growth data
        const tempMonths: any[] = [];
        for (let i = 11; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          tempMonths.push({
            name: d.toLocaleString('en-US', { month: 'short' }),
            year: d.getFullYear(),
            monthVal: d.getMonth(),
            revenue: 0
          });
        }

        allOrders.forEach(order => {
          if (order.status !== 'Cancelled') {
            const oDate = new Date(order.created_at);
            const oMonth = oDate.getMonth();
            const oYear = oDate.getFullYear();
            const match = tempMonths.find(m => m.monthVal === oMonth && m.year === oYear);
            if (match) {
              match.revenue += order.total;
            }
          }
        });
        setLast12Months(tempMonths);

        // 6. Generate Top Selling Products
        const productSalesMap: Record<string, { name: string; sales: number; revenue: number; prevSales: number }> = {};

        allOrderItems.forEach(item => {
          const order = allOrders.find(o => o.id === item.order_id);
          if (!order || order.status === 'Cancelled') return;

          const title = item.product_title || 'Unknown Product';
          const createdDate = new Date(order.created_at);

          if (!productSalesMap[title]) {
            productSalesMap[title] = { name: title, sales: 0, revenue: 0, prevSales: 0 };
          }

          if (createdDate >= thirtyDaysAgo) {
            productSalesMap[title].sales += item.quantity;
            productSalesMap[title].revenue += item.quantity * item.price;
          } else if (createdDate >= sixtyDaysAgo && createdDate < thirtyDaysAgo) {
            productSalesMap[title].prevSales += item.quantity;
          }
        });

        // Fallback to all-time sales if last 30 days is empty
        const totalPeriodASales = Object.values(productSalesMap).reduce((sum, p) => sum + p.sales, 0);
        if (totalPeriodASales === 0) {
          allOrderItems.forEach(item => {
            const order = allOrders.find(o => o.id === item.order_id);
            if (!order || order.status === 'Cancelled') return;
            const title = item.product_title || 'Unknown Product';
            if (productSalesMap[title]) {
              productSalesMap[title].sales += item.quantity;
              productSalesMap[title].revenue += item.quantity * item.price;
            }
          });
        }

        const sortedTop = Object.values(productSalesMap)
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5)
          .map(p => {
            let growth = 0;
            if (p.prevSales > 0) {
              growth = Math.round(((p.sales - p.prevSales) / p.prevSales) * 100);
            } else if (p.sales > 0) {
              growth = 100;
            }
            return {
              name: p.name,
              sales: p.sales,
              revenue: p.revenue,
              growth
            };
          });
        setTopProducts(sortedTop);

        // 7. Generate Category breakdown data
        const categoryRevenueMap: Record<string, number> = {
          'ওয়াটারপ্রুফ চাদর': 0,
          'ডায়াপার': 0,
          'মশারী': 0,
          'Uncategorized': 0
        };

        allOrderItems.forEach(item => {
          const order = allOrders.find(o => o.id === item.order_id);
          if (!order || order.status === 'Cancelled') return;

          let category = 'Uncategorized';
          const matchedProd = allProducts.find(p => p.title === item.product_title || p.id === item.product_id);
          if (matchedProd && matchedProd.category) {
            category = normalizeCategory(matchedProd.category);
          } else {
            category = normalizeCategory(item.product_title);
          }

          if (categoryRevenueMap[category] === undefined) {
            categoryRevenueMap[category] = 0;
          }
          categoryRevenueMap[category] += item.quantity * item.price;
        });

        const totalCatRevenue = Object.values(categoryRevenueMap).reduce((a, b) => a + b, 0);
        const colorsMap: Record<string, string> = {
          'ওয়াটারপ্রুফ চাদর': '#ff5a00',
          'ডায়াপার': '#3b82f6',
          'মশারী': '#10b981',
          'Uncategorized': '#8b5cf6'
        };

        const tempSalesData = Object.keys(categoryRevenueMap).map(cat => {
          const rev = categoryRevenueMap[cat];
          const percentage = totalCatRevenue > 0 ? Math.round((rev / totalCatRevenue) * 100) : 0;
          return {
            category: cat,
            percentage,
            color: colorsMap[cat] || '#8b5cf6'
          };
        }).filter(item => item.percentage > 0 || totalCatRevenue === 0);
        setSalesData(tempSalesData);

        // 8. Generate Daily Activity (last 14 days)
        const tempActivity: any[] = [];
        for (let i = 13; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          tempActivity.push({
            day: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
            dateKey: d.toDateString(),
            value: 0
          });
        }

        allOrders.forEach(order => {
          if (order.status !== 'Cancelled') {
            const oDateKey = new Date(order.created_at).toDateString();
            const match = tempActivity.find(ad => ad.dateKey === oDateKey);
            if (match) {
              match.value += order.total;
            }
          }
        });
        setActivityData(tempActivity);

      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExportCSV = () => {
    const rows = [
      ['Report', `Business Analytics - ${siteConfig.name}`],
      ['Date', new Date().toLocaleDateString()],
      [''],
      ['Summary Metrics (Last 30 Days)'],
      ['Metric', 'Value'],
      ['Total Revenue', `৳${stats.totalRevenue}`],
      ['Total Orders', stats.totalOrders],
      ['Average Order Value', `৳${Math.round(stats.avgOrderValue)}`],
      ['Total Customers', stats.totalCustomers],
      ['Customer Growth', `${stats.customerGrowth.toFixed(1)}%`],
      [''],
      ['Top Selling Products'],
      ['Product Name', 'Sales Volume', 'Total Revenue', 'Monthly Growth'],
      ...topProducts.map(p => [p.name, `${p.sales} units`, `৳${p.revenue}`, `${p.growth}%`])
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${siteConfig.logoTextShort}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxRevenue = Math.max(...last12Months.map(m => m.revenue), 1);

  return (
    <AdminLayout>
      <div className={styles.sectionHeader}>
        <div>
          <h1 className={styles.pageTitle}>Business Reports</h1>
          <p className={styles.pageSubtitle}>Detailed insights into your store's performance and growth.</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.select} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <HugeiconsIcon icon={Calendar01Icon} size={18} />
            <span>Last 30 Days</span>
          </div>
          <button 
            className={styles.primaryBtn} 
            style={{ background: 'var(--bg-white)', color: 'var(--text-dark)', border: '1px solid var(--border-color)' }}
            onClick={handleExportCSV}
          >
            <HugeiconsIcon icon={Download01Icon} size={20} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard 
              label="Total Revenue" 
              value={`৳${stats.totalRevenue.toLocaleString()}`} 
              icon={Dollar01Icon} 
              trend={`${stats.revenueTrend >= 0 ? '+' : ''}${stats.revenueTrend.toFixed(1)}%`} 
              trendUp={stats.revenueTrend >= 0} 
              color="#ff5a00" 
            />
            <StatCard 
              label="Total Orders" 
              value={stats.totalOrders.toLocaleString()} 
              icon={ShoppingBag01Icon} 
              trend={`${stats.ordersTrend >= 0 ? '+' : ''}${stats.ordersTrend.toFixed(1)}%`} 
              trendUp={stats.ordersTrend >= 0} 
              color="#3b82f6" 
            />
            <StatCard 
              label="Average Order Value" 
              value={`৳${Math.round(stats.avgOrderValue).toLocaleString()}`} 
              icon={ChartLineData01Icon} 
              trend={`${stats.aovTrend >= 0 ? '+' : ''}${stats.aovTrend.toFixed(1)}%`} 
              trendUp={stats.aovTrend >= 0} 
              color="#10b981" 
            />
            <StatCard 
              label="Total Customers" 
              value={stats.totalCustomers.toLocaleString()} 
              icon={UserGroupIcon} 
              trend={`${stats.customerGrowth >= 0 ? '+' : ''}${stats.customerGrowth.toFixed(1)}%`} 
              trendUp={stats.customerGrowth >= 0} 
              color="#8b5cf6" 
            />
          </>
        )}
      </div>

      <div className={styles.dashboardGrid}>
        <section className={styles.section} style={{ flex: 2 }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Revenue Growth (Last 12 Months)</h2>
            <div className={styles.headerActions}>
               <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }}></div> Current Period
               </span>
            </div>
          </div>

          <div style={{ height: '300px', width: '100%', position: 'relative', marginTop: '20px' }}>
            {/* Real Chart Visualization */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '0 10px' }}>
              {last12Months.map((m, i) => (
                <div key={i} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div 
                    title={`৳${m.revenue.toLocaleString()}`}
                    style={{ 
                      width: '100%', 
                      height: `${(m.revenue / maxRevenue) * 90}%`, 
                      background: 'linear-gradient(180deg, var(--primary-color) 0%, rgba(255, 90, 0, 0.1) 100%)', 
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 1s ease-out',
                      cursor: 'pointer'
                    }} 
                  />
                  <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '8px' }}>
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Grid Lines */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: '100%', borderBottom: '1px dashed var(--border-color)', height: 0 }} />
              ))}
            </div>
          </div>
        </section>

        <div style={{ flex: 1 }}>
          <SalesAnalytics salesData={salesData} activityData={activityData} />
          
          <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(255, 90, 0, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 90, 0, 0.1)' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <HugeiconsIcon icon={InformationCircleIcon} size={20} color="var(--primary-color)" />
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '4px' }}>Store Insights</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)', lineHeight: '1.5' }}>
                  Insights and recommendations are now automatically compiled based on the real-time orders, traffic, and sales records in your database.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section} style={{ marginTop: '24px' }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Top Selling Products</h2>
          <button 
            className={styles.viewAllLink} 
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={handleExportCSV}
          >
            Download Report
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Sales Volume</th>
                <th>Total Revenue</th>
                <th>Monthly Growth</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)' }}>
                    No product sales records found in this period.
                  </td>
                </tr>
              ) : (
                topProducts.map((product, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '600' }}>{product.name}</td>
                    <td>{product.sales} units</td>
                    <td>৳{product.revenue.toLocaleString()}</td>
                    <td>
                      <span style={{ color: product.growth > 0 ? '#10b981' : product.growth < 0 ? '#ef4444' : 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        {product.growth > 0 ? <HugeiconsIcon icon={ArrowUp01Icon} size={14} /> : product.growth < 0 ? <HugeiconsIcon icon={ArrowDown01Icon} size={14} /> : null}
                        {Math.abs(product.growth)}%
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles.statusSuccess}`}>Trending</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
