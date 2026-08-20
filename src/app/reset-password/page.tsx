'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { HugeiconsIcon } from '@hugeicons/react';
import { LockPasswordIcon, ViewIcon, ViewOffIcon, Tick02Icon } from '@hugeicons/core-free-icons';
import styles from '../admin/login/Login.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user is actually authenticated (recovery session loaded)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If there's no session, it might take a split second for Supabase to parse the URL hash.
        // Let's listen to auth state changes to catch it.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
              console.log('Password recovery mode detected.');
            }
          }
        );
        return () => subscription.unsubscribe();
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h2>Set New Password</h2>
          <p>Please choose a secure password for your moderator account.</p>
        </div>

        {error && (
          <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: '16px' }}>
              <HugeiconsIcon icon={Tick02Icon} size={28} />
            </div>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Password Saved!</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Your password has been updated successfully. Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label>New Password</label>
              <div className={styles.inputWrapper}>
                <HugeiconsIcon icon={LockPasswordIcon} size={20} className={styles.inputIcon} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${styles.input} ${styles.inputWithIcon}`}
                  required
                />
                <button 
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={20} />
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <HugeiconsIcon icon={LockPasswordIcon} size={20} className={styles.inputIcon} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${styles.input} ${styles.inputWithIcon}`}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading}
              style={{ marginTop: '10px' }}
            >
              <span>{loading ? 'Saving Password...' : 'Save Password & Login'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
