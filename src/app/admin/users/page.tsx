'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Search01Icon, 
  UserGroupIcon, 
  UserAdd01Icon,
  FilterIcon,
  MoreHorizontalIcon,
  Mail01Icon,
  Delete02Icon,
  Edit01Icon,
  UserCheck01Icon,
  UserBlock01Icon,
  Download01Icon,
  Cancel01Icon
} from '@hugeicons/core-free-icons';
import styles from '../Admin.module.css';
import StatCard from '../../../components/admin/StatCard';
import { supabase } from '../../../lib/supabase';
import { StatCardSkeleton, TableRowSkeleton } from '../../../components/admin/Skeleton';
import { siteConfig } from '../../../lib/config';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
  avatar_url: string | null;
}

const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Add New User states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [creatingUser, setCreatingUser] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    setCreatingUser(true);
    try {
      // 1. Sign up the user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            full_name: newUserName,
            role: newUserRole
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // 2. Update the role in profiles table (overriding the default trigger role)
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            full_name: newUserName,
            role: newUserRole 
          })
          .eq('id', data.user.id);

        if (profileError) throw profileError;

        alert('User created successfully!');
        setIsModalOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('user');
        fetchUsers();
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      alert(`Failed to create user: ${err.message || JSON.stringify(err)}`);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (user: Profile) => {
    const confirm = window.confirm(`Are you sure you want to delete ${user.full_name || user.email}? This action cannot be undone.`);
    if (!confirm) return;

    try {
      // Try deleting using the PostgreSQL RPC function
      const { error: rpcError } = await supabase.rpc('delete_user_by_admin', { user_id: user.id });

      if (rpcError) {
        console.warn('RPC delete failed, trying direct profiles table delete:', rpcError.message);
        // Fallback: Delete from profiles table directly (in case RPC is not defined yet)
        const { error: dbError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);

        if (dbError) throw dbError;
      }

      alert('User deleted successfully!');
      fetchUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(`Failed to delete user: ${err.message || JSON.stringify(err)}`);
    }
  };

  const handleMakeModerator = async (user: Profile) => {
    if (!user.email) {
      alert('User does not have an email address.');
      return;
    }
    const confirm = window.confirm(`Are you sure you want to make ${user.full_name || user.email} a moderator? This will send a password setup link to their email.`);
    if (!confirm) return;

    try {
      // 1. Update role in profiles table
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ role: 'moderator' })
        .eq('id', user.id);

      if (dbError) throw dbError;

      // 2. Send password setup/reset email
      const { error: authError } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (authError) throw authError;

      alert('Successfully made moderator! Password setup email has been sent.');
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(`Error assigning moderator role: ${err.message || JSON.stringify(err)}`);
    }
  };

  const handleRemoveModerator = async (user: Profile) => {
    const confirm = window.confirm(`Are you sure you want to remove moderator role from ${user.full_name || user.email}?`);
    if (!confirm) return;

    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', user.id);

      if (dbError) throw dbError;

      alert('Successfully removed moderator role.');
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message || JSON.stringify(err)}`);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error.message);
        setUsers([]);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // Close menu when clicking outside
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesSearch = (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'Super Admin' || u.role === 'Admin' || u.role === 'moderator').length;
  const newUsersThisMonth = users.filter(u => {
    const date = new Date(u.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Joined Date'];
    const rows = filteredUsers.map(user => [
      user.full_name || 'N/A',
      user.email || 'N/A',
      user.role || 'Customer',
      new Date(user.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${siteConfig.logoTextShort.toLowerCase()}-users-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <AdminLayout>
      <div className={styles.sectionHeader}>
        <div>
          <h1 className={styles.pageTitle}>Users Management</h1>
          <p className={styles.pageSubtitle}>Manage your store customers and administrative staff.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={handleExportCSV}>
            <HugeiconsIcon icon={Download01Icon} size={20} />
            <span>Export CSV</span>
          </button>
          <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
            <HugeiconsIcon icon={UserAdd01Icon} size={20} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard 
              label="Total Users" 
              value={totalUsers.toString()} 
              icon={UserGroupIcon} 
              color="#3b82f6" 
            />
            <StatCard 
              label="Admin Staff" 
              value={adminUsers.toString()} 
              icon={UserCheck01Icon} 
              color="#10b981" 
            />
            <StatCard 
              label="New This Month" 
              value={newUsersThisMonth.toString()} 
              icon={UserAdd01Icon} 
              color="#ff5a00" 
            />
          </>
        )}
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchContainer}>
          <HugeiconsIcon icon={Search01Icon} size={18} color="var(--text-light)" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <select 
            className={styles.select} 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="Customer">Customer</option>
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} columns={6} />
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className={styles.userAvatar} style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                          {user.full_name?.[0] || user.email?.[0] || 'U'}
                        </div>
                        <span style={{ fontWeight: '600' }}>{user.full_name || 'Unnamed User'}</span>
                      </div>
                    </td>
                    <td>{user.email || 'No email'}</td>
                    <td>
                      <span className={`${styles.status} ${user.role === 'Super Admin' || user.role === 'Admin' ? styles.statusProcessing : styles.statusSuccess}`}>
                        {user.role || 'Customer'}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`${styles.status} ${styles.statusSuccess}`}>Active</span>
                    </td>
                    <td>
                      <div className={styles.actionBtns} style={{ position: 'relative' }}>
                        <button 
                          className={styles.actionBtn} 
                          title="Edit User"
                        >
                          <HugeiconsIcon icon={Edit01Icon} size={18} />
                        </button>
                        <button 
                          className={styles.actionBtn} 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === user.id ? null : user.id);
                          }}
                        >
                          <HugeiconsIcon icon={MoreHorizontalIcon} size={18} />
                        </button>

                         {activeMenu === user.id && (
                          <div className={styles.actionDropdown} onClick={(e) => e.stopPropagation()}>
                            {user.role !== 'moderator' ? (
                              <button 
                                className={styles.actionDropdownItem}
                                onClick={() => handleMakeModerator(user)}
                              >
                                <HugeiconsIcon icon={UserCheck01Icon} size={16} />
                                <span>Make Moderator</span>
                              </button>
                            ) : (
                              <button 
                                className={styles.actionDropdownItem}
                                onClick={() => handleRemoveModerator(user)}
                              >
                                <HugeiconsIcon icon={UserBlock01Icon} size={16} />
                                <span>Remove Moderator</span>
                              </button>
                            )}
                            <button className={styles.actionDropdownItem}>
                              <HugeiconsIcon icon={Mail01Icon} size={16} />
                              <span>Send Email</span>
                            </button>
                            <button className={styles.actionDropdownItem}>
                              <HugeiconsIcon icon={UserBlock01Icon} size={16} />
                              <span>Suspend User</span>
                            </button>
                            <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }}></div>
                            <button 
                              className={`${styles.actionDropdownItem} ${styles.actionDropdownItemDanger}`}
                              onClick={() => handleDeleteUser(user)}
                            >
                              <HugeiconsIcon icon={Delete02Icon} size={16} />
                              <span>Delete User</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            backgroundColor: '#18181b',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>Add New User</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name *</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="e.g. John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address *</label>
                <input 
                  type="email" 
                  className={styles.input} 
                  placeholder="e.g. john@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Temporary Password *</label>
                <input 
                  type="password" 
                  className={styles.input} 
                  placeholder="At least 6 characters"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Role *</label>
                <select 
                  className={styles.select}
                  style={{ width: '100%' }}
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  <option value="user">Customer / User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className={styles.secondaryBtn} 
                  onClick={() => setIsModalOpen(false)}
                  disabled={creatingUser}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.primaryBtn}
                  disabled={creatingUser}
                >
                  {creatingUser ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UsersManagementPage;
