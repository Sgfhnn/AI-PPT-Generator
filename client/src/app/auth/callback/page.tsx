'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            const handleLogin = async () => {
                try {
                    await loginWithToken(token);
                    router.push('/create');
                } catch (error) {
                    console.error('OAuth callback error:', error);
                    router.push('/login?error=oauth_failed');
                }
            };
            handleLogin();
        } else {
            // Failed, go back to login
            router.push('/login?error=oauth_failed');
        }
    }, [router, searchParams, loginWithToken]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)'
        }}>
            <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthCallbackContent />
        </Suspense>
    );
}
