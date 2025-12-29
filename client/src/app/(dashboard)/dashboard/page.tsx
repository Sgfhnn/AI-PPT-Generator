'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { presentationsApi } from '@/lib/api';

// Icons
const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5V19" />
        <path d="M5 12H19" />
    </svg>
);

const PresentationIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21L12 17L16 21" />
        <path d="M12 17V13" />
    </svg>
);

const SlidesIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
    </svg>
);

const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6V12L16 14" />
    </svg>
);

interface Presentation {
    _id: string;
    title: string;
    slideCount: number;
    theme: string;
    status: string;
    createdAt: string;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [presentations, setPresentations] = useState<Presentation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPresentations();
    }, []);

    const loadPresentations = async () => {
        try {
            const response = await presentationsApi.getAll({ limit: 6 });
            if (response.success && response.data) {
                const data = response.data as { presentations: Presentation[] };
                setPresentations(data.presentations);
            }
        } catch (error) {
            console.error('Failed to load presentations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="page-subtitle">
                        Ready to create something amazing today?
                    </p>
                </div>
                <Link href="/create" className="btn btn-primary">
                    <PlusIcon />
                    New Presentation
                </Link>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{user?.presentationsCount || 0}</div>
                    <div className="stat-label">Total Presentations</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{presentations.filter(p => p.status === 'generated').length}</div>
                    <div className="stat-label">Generated</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{presentations.filter(p => p.status === 'exported').length}</div>
                    <div className="stat-label">Exported</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Quick Actions
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    <Link href="/create?mode=text" className="glass-card" style={{
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-primary)'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" />
                                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" />
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontWeight: '600' }}>From Text</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Paste your content</div>
                        </div>
                    </Link>

                    <Link href="/create?mode=file" className="glass-card" style={{
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'rgba(139, 92, 246, 0.15)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-secondary)'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" />
                                <path d="M17 8L12 3L7 8" />
                                <path d="M12 3V15" />
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontWeight: '600' }}>From File</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Upload PDF/Word</div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Presentations */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                        Recent Presentations
                    </h2>
                    {presentations.length > 0 && (
                        <Link href="/presentations" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem' }}>
                            View all →
                        </Link>
                    )}
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                ) : presentations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <PresentationIcon />
                        </div>
                        <h3 className="empty-state-title">No presentations yet</h3>
                        <p className="empty-state-text">
                            Create your first presentation to get started
                        </p>
                        <Link href="/create" className="btn btn-primary">
                            <PlusIcon />
                            Create Presentation
                        </Link>
                    </div>
                ) : (
                    <div className="presentations-grid">
                        {presentations.map((presentation) => (
                            <Link
                                key={presentation._id}
                                href={`/presentations/${presentation._id}`}
                                className="presentation-card"
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div className="presentation-card-preview">
                                    <PresentationIcon />
                                </div>
                                <div className="presentation-card-body">
                                    <h3 className="presentation-card-title">{presentation.title}</h3>
                                    <div className="presentation-card-meta">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <SlidesIcon />
                                            {presentation.slideCount} slides
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <ClockIcon />
                                            {formatDate(presentation.createdAt)}
                                        </span>
                                    </div>
                                    <div className="presentation-card-actions">
                                        <span className={`badge ${presentation.status === 'exported' ? 'badge-success' : 'badge-primary'}`}>
                                            {presentation.status}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
