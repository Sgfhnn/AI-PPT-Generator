'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, authApi } from '@/lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    presentationsCount: number;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
    loginWithToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = api.getToken();
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await authApi.getMe();
            if (response.success && response.data) {
                setUser((response.data as { user: User }).user);
            }
        } catch {
            api.setToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        if (response.success && response.data) {
            const data = response.data as { user: User; token: string };
            api.setToken(data.token);
            setUser(data.user);
        } else {
            throw new Error(response.message || 'Login failed');
        }
    };

    const register = async (name: string, email: string, password: string) => {
        const response = await authApi.register({ name, email, password });
        if (response.success) {
            if (response.data && (response.data as { token?: string }).token) {
                const data = response.data as { user: User; token: string };
                api.setToken(data.token);
                setUser(data.user);
            }
            // If no token, we don't set user/token, which is correct for mandatory verification
        } else {
            throw new Error(response.message || 'Registration failed');
        }
    };

    const logout = () => {
        api.setToken(null);
        setUser(null);
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...data });
        }
    };

    const loginWithToken = async (token: string) => {
        setIsLoading(true);
        api.setToken(token);
        try {
            await checkAuth();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                updateUser,
                loginWithToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
