'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const SparklesIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
    </svg>
);

const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

    const handleOAuth = async (provider: 'google' | 'github') => {
        setIsOAuthLoading(provider);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const baseUrl = apiUrl.replace('/api', '');

        // Ping the health check to wake up Render if it's sleeping
        try {
            await fetch(`${apiUrl}/health`).catch(() => { });
        } catch (e) {
            // Ignore
        }

        window.location.href = `${baseUrl}/api/auth/${provider}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

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

                {/* Login Card */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                            Welcome Back
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Sign in to continue creating presentations
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

                    <form onSubmit={handleSubmit}>
                        <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                            <label className="input-label" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="input-label" htmlFor="password">
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '0.25rem'
                                    }}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                            <Link href="/forgot-password" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: '500' }}>
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner" style={{ width: '20px', height: '20px' }} />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }} />
                        <span style={{ padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }} />
                    </div>

                    <button
                        onClick={() => handleOAuth('github')}
                        className="btn btn-secondary"
                        style={{ width: '100%', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer' }}
                        disabled={!!isOAuthLoading}
                    >
                        {isOAuthLoading === 'github' ? (
                            <div className="spinner" style={{ width: '20px', height: '20px' }} />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        )}
                        {isOAuthLoading === 'github' ? 'Waking up server...' : 'Continue with GitHub'}
                    </button>

                    <div style={{
                        textAlign: 'center',
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid var(--border-glass)'
                    }}>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Don&apos;t have an account?{' '}
                            <Link href="/register" style={{ color: 'var(--accent-primary)', fontWeight: '500' }}>
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                <p style={{
                    textAlign: 'center',
                    marginTop: '1.5rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem'
                }}>
                    <Link href="/" style={{ color: 'var(--text-muted)' }}>
                        ← Back to home
                    </Link>
                </p>
            </div>
        </div>
    );
}
