'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';

const SparklesIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
    </svg>
);

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.resetPassword({ token, password });
            if (response.success) {
                setSuccess('Password has been reset successfully. Redirecting to login...');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    Reset Password
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Enter your new password below
                </p>
            </div>

            {error && (
                <div style={{
                    padding: '0.875rem 1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--error)',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem'
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    padding: '0.875rem 1rem',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--success)',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem'
                }}>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="input-label" htmlFor="password">
                        New Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        className="input"
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={!token || isLoading}
                    />
                </div>

                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="input-label" htmlFor="confirmPassword">
                        Confirm New Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        className="input"
                        placeholder="Repeat new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={!token || isLoading}
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={!token || isLoading}
                >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px'
            }}>
                {/* Logo */}
                <Link
                    href="/"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        marginBottom: '2rem',
                        textDecoration: 'none'
                    }}
                >
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--accent-gradient)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <SparklesIcon />
                    </div>
                    <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        AI PPT Generator
                    </span>
                </Link>

                <Suspense fallback={
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                        <p style={{ color: 'var(--text-secondary)' }}>Loading reset form...</p>
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
