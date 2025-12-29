'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';

const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" />
    </svg>
);

const PaletteIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2C14.5 5 16 8 16 12C16 16 14.5 19 12 22" />
        <path d="M12 2C9.5 5 8 8 8 12C8 16 9.5 19 12 22" />
        <path d="M2 12H22" />
    </svg>
);

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Profile form
    const [name, setName] = useState(user?.name || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setProfileMessage('');

        try {
            const response = await authApi.updateProfile({ name });
            if (response.success) {
                updateUser({ name });
                setProfileMessage('Profile updated successfully!');
            }
        } catch (err) {
            setProfileMessage(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setPasswordMessage('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordMessage('Password must be at least 6 characters');
            return;
        }

        setIsSavingPassword(true);
        setPasswordMessage('');

        try {
            const response = await authApi.changePassword({ currentPassword, newPassword });
            if (response.success) {
                setPasswordMessage('Password changed successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            setPasswordMessage(err instanceof Error ? err.message : 'Failed to change password');
        } finally {
            setIsSavingPassword(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <UserIcon /> },
        { id: 'security', label: 'Security', icon: <LockIcon /> },
        { id: 'preferences', label: 'Preferences', icon: <PaletteIcon /> },
    ];

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your account settings</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', maxWidth: '900px' }}>
                {/* Tabs */}
                <div style={{
                    width: '200px',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.875rem 1rem',
                                background: activeTab === tab.id ? 'var(--surface-glass)' : 'transparent',
                                border: '1px solid',
                                borderColor: activeTab === tab.id ? 'var(--border-glass-hover)' : 'transparent',
                                borderRadius: 'var(--radius-md)',
                                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                                textAlign: 'left',
                                width: '100%'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                    {activeTab === 'profile' && (
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                                Profile Information
                            </h2>

                            <form onSubmit={handleSaveProfile}>
                                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                    <label className="input-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                    <label className="input-label">Email</label>
                                    <input
                                        type="email"
                                        className="input"
                                        value={user?.email || ''}
                                        disabled
                                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        Email cannot be changed
                                    </p>
                                </div>

                                {profileMessage && (
                                    <div style={{
                                        padding: '0.875rem',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '1rem',
                                        background: profileMessage.includes('success')
                                            ? 'rgba(34, 197, 94, 0.1)'
                                            : 'rgba(239, 68, 68, 0.1)',
                                        color: profileMessage.includes('success')
                                            ? 'var(--success)'
                                            : 'var(--error)',
                                        fontSize: '0.875rem'
                                    }}>
                                        {profileMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSavingProfile}
                                >
                                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                                Change Password
                            </h2>

                            <form onSubmit={handleChangePassword}>
                                <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                                    <label className="input-label">Current Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                                    <label className="input-label">New Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                    <label className="input-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {passwordMessage && (
                                    <div style={{
                                        padding: '0.875rem',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '1rem',
                                        background: passwordMessage.includes('success')
                                            ? 'rgba(34, 197, 94, 0.1)'
                                            : 'rgba(239, 68, 68, 0.1)',
                                        color: passwordMessage.includes('success')
                                            ? 'var(--success)'
                                            : 'var(--error)',
                                        fontSize: '0.875rem'
                                    }}>
                                        {passwordMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSavingPassword}
                                >
                                    {isSavingPassword ? 'Changing...' : 'Change Password'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                                Preferences
                            </h2>

                            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                                <PaletteIcon />
                                <p style={{ marginTop: '1rem' }}>
                                    More preferences coming soon!
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
