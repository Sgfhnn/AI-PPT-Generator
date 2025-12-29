'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { presentationsApi } from '@/lib/api';

// Icons
const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5V19" />
        <path d="M5 12H19" />
    </svg>
);

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21L16.65 16.65" />
    </svg>
);

const PresentationIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21L12 17L16 21" />
        <path d="M12 17V13" />
    </svg>
);

const SlidesIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
    </svg>
);

const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6V12L16 14" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6H5H21" />
        <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" />
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

export default function PresentationsPage() {
    const [presentations, setPresentations] = useState<Presentation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'generated' | 'exported'>('all');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        loadPresentations();
    }, []);

    const loadPresentations = async () => {
        try {
            const response = await presentationsApi.getAll({ limit: 100 });
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

    const handleDelete = async (id: string) => {
        try {
            await presentationsApi.delete(id);
            setPresentations(presentations.filter(p => p._id !== id));
            setDeleteId(null);
        } catch (error) {
            console.error('Failed to delete:', error);
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

    const filteredPresentations = presentations.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || p.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Presentations</h1>
                    <p className="page-subtitle">
                        {presentations.length} presentation{presentations.length !== 1 ? 's' : ''} total
                    </p>
                </div>
                <Link href="/create" className="btn btn-primary">
                    <PlusIcon />
                    New Presentation
                </Link>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap'
            }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '400px' }}>
                    <SearchIcon />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search presentations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '2.75rem' }}
                    />
                    <div style={{
                        position: 'absolute',
                        left: '0.875rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        pointerEvents: 'none'
                    }}>
                        <SearchIcon />
                    </div>
                </div>

                <div className="tabs" style={{ padding: '0.25rem' }}>
                    {(['all', 'generated', 'exported'] as const).map((f) => (
                        <button
                            key={f}
                            className={`tab ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                            style={{ padding: '0.5rem 1rem', textTransform: 'capitalize' }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            ) : filteredPresentations.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <PresentationIcon />
                    </div>
                    <h3 className="empty-state-title">
                        {searchQuery || filter !== 'all' ? 'No matching presentations' : 'No presentations yet'}
                    </h3>
                    <p className="empty-state-text">
                        {searchQuery || filter !== 'all'
                            ? 'Try adjusting your search or filter'
                            : 'Create your first presentation to get started'}
                    </p>
                    {!searchQuery && filter === 'all' && (
                        <Link href="/create" className="btn btn-primary">
                            <PlusIcon />
                            Create Presentation
                        </Link>
                    )}
                </div>
            ) : (
                <div className="presentations-grid">
                    {filteredPresentations.map((presentation) => (
                        <div
                            key={presentation._id}
                            className="presentation-card"
                            style={{ position: 'relative' }}
                        >
                            <Link
                                href={`/presentations/${presentation._id}`}
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
                                </div>
                            </Link>
                            <div className="presentation-card-actions" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span className={`badge ${presentation.status === 'exported' ? 'badge-success' : 'badge-primary'}`}>
                                    {presentation.status}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setDeleteId(presentation._id);
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        borderRadius: 'var(--radius-sm)',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'var(--error)';
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'var(--text-muted)';
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                            Delete Presentation?
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            This action cannot be undone. The presentation and all its data will be permanently deleted.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDeleteId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn"
                                onClick={() => handleDelete(deleteId)}
                                style={{
                                    background: 'var(--error)',
                                    color: 'white'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
