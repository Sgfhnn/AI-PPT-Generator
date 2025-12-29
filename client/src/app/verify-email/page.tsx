'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

        const verify = async () => {
            try {
                const response = await authApi.verifyEmail(token);
                if (response.success) {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setMessage(response.message || 'Verification failed');
                }
            } catch (err) {
                setStatus('error');
                setMessage(err instanceof Error ? err.message : 'Verification failed');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="auth-container fade-in">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <h1 className="auth-title">Email Verification</h1>

                {status === 'verifying' && (
                    <div className="loading-dots" style={{ justifyContent: 'center', margin: '2rem 0' }}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}

                {status === 'success' && (
                    <div className="fade-in">
                        <div style={{
                            color: 'var(--success)',
                            fontSize: '4rem',
                            marginBottom: '1rem'
                        }}>
                            ✓
                        </div>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                            Your email has been successfully verified!
                        </p>
                        <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
                            Proceed to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="fade-in">
                        <div style={{
                            color: 'var(--error)',
                            fontSize: '4rem',
                            marginBottom: '1rem'
                        }}>
                            ✕
                        </div>
                        <p style={{ marginBottom: '2rem', color: 'var(--error)' }}>
                            {message}
                        </p>
                        <Link href="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
