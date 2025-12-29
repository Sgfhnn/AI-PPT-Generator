'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { presentationsApi, generateApi } from '@/lib/api';
import SlidePreview from '@/components/SlidePreview';
import PresentationViewer from '@/components/PresentationViewer';

// Icons
const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5" />
        <path d="M12 19L5 12L12 5" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" />
        <path d="M7 10L12 15L17 10" />
        <path d="M12 15V3" />
    </svg>
);

const SparklesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6H5H21" />
        <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" />
    </svg>
);

const PlayIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

interface Slide {
    slideNumber: number;
    title: string;
    content: string[];
    notes?: string;
    layout: string;
}

interface Presentation {
    _id: string;
    title: string;
    description: string;
    slides: Slide[];
    theme: string;
    status: string;
    createdAt: string;
    sourceType: string;
}

export default function PresentationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [presentation, setPresentation] = useState<Presentation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [showImproveModal, setShowImproveModal] = useState(false);
    const [improveInstruction, setImproveInstruction] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPresentationViewer, setShowPresentationViewer] = useState(false);
    const [enableAnimations, setEnableAnimations] = useState(false);

    useEffect(() => {
        loadPresentation();
    }, [params.id]);

    const loadPresentation = async () => {
        try {
            const response = await presentationsApi.getOne(params.id as string);
            if (response.success && response.data) {
                const data = response.data as { presentation: Presentation };
                setPresentation(data.presentation);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load presentation');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        if (!presentation) return;

        setIsExporting(true);
        setError('');

        try {
            const response = await presentationsApi.export(presentation._id, { enableAnimations });

            if (response.success) {
                // Download the file
                const downloadUrl = presentationsApi.getDownloadUrl(presentation._id);
                const token = localStorage.getItem('token');

                if (token) {
                    const res = await fetch(downloadUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${presentation.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                    // Update status
                    setPresentation({ ...presentation, status: 'exported' });
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to export');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImprove = async () => {
        if (!presentation || !improveInstruction.trim()) return;

        setIsImproving(true);
        setError('');

        try {
            const response = await generateApi.improve(presentation._id, improveInstruction);

            if (response.success && response.data) {
                const data = response.data as { presentation: Presentation };
                setPresentation(data.presentation);
                setShowImproveModal(false);
                setImproveInstruction('');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to improve presentation');
        } finally {
            setIsImproving(false);
        }
    };

    const handleDelete = async () => {
        if (!presentation) return;

        try {
            await presentationsApi.delete(presentation._id);
            router.push('/presentations');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50vh'
            }}>
                <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        );
    }

    if (error && !presentation) {
        return (
            <div className="empty-state">
                <h3 className="empty-state-title">Error</h3>
                <p className="empty-state-text">{error}</p>
                <Link href="/presentations" className="btn btn-primary">
                    Back to Presentations
                </Link>
            </div>
        );
    }

    if (!presentation) {
        return (
            <div className="empty-state">
                <h3 className="empty-state-title">Presentation not found</h3>
                <Link href="/presentations" className="btn btn-primary">
                    Back to Presentations
                </Link>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <Link
                        href="/presentations"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem',
                            marginBottom: '0.5rem'
                        }}
                    >
                        <ArrowLeftIcon />
                        Back to Presentations
                    </Link>
                    <h1 className="page-title">{presentation.title}</h1>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginTop: '0.5rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem'
                    }}>
                        <span>{presentation.slides.length} slides</span>
                        <span>•</span>
                        <span>Created {formatDate(presentation.createdAt)}</span>
                        <span>•</span>
                        <span className={`badge ${presentation.status === 'exported' ? 'badge-success' : 'badge-primary'}`}>
                            {presentation.status}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => setShowImproveModal(true)}
                        className="btn btn-secondary"
                    >
                        <SparklesIcon />
                        Improve with AI
                    </button>
                    <button
                        onClick={() => setShowPresentationViewer(true)}
                        className="btn btn-secondary"
                        style={{ background: 'var(--accent-gradient)', border: 'none', color: 'white' }}
                    >
                        <PlayIcon />
                        Present
                    </button>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', marginRight: '0.5rem' }}>
                        <input
                            type="checkbox"
                            checked={enableAnimations}
                            onChange={(e) => setEnableAnimations(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                        />
                        Animations
                    </label>
                    <button
                        onClick={handleExport}
                        className="btn btn-primary"
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <>
                                <div className="spinner" style={{ width: '18px', height: '18px' }} />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <DownloadIcon />
                                Export to PPTX
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="btn btn-ghost"
                        style={{ color: 'var(--error)' }}
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>

            {error && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--error)',
                    marginBottom: '1.5rem'
                }}>
                    {error}
                </div>
            )}

            {/* Slides */}
            <SlidePreview
                slides={presentation.slides}
                theme={presentation.theme}
            />

            {/* Improve Modal */}
            {showImproveModal && (
                <div className="modal-overlay" onClick={() => setShowImproveModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                            Improve Presentation with AI
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Tell the AI how you&apos;d like to improve your presentation
                        </p>

                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <textarea
                                className="input textarea"
                                placeholder="E.g., Make the content more concise, add more examples, improve the titles..."
                                value={improveInstruction}
                                onChange={(e) => setImproveInstruction(e.target.value)}
                                style={{ minHeight: '100px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowImproveModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleImprove}
                                disabled={isImproving || !improveInstruction.trim()}
                            >
                                {isImproving ? (
                                    <>
                                        <div className="spinner" style={{ width: '18px', height: '18px' }} />
                                        Improving...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon />
                                        Improve
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
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
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn"
                                onClick={handleDelete}
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

            {/* Presentation Viewer */}
            {showPresentationViewer && presentation && (
                <PresentationViewer
                    slides={presentation.slides}
                    theme={presentation.theme}
                    onClose={() => setShowPresentationViewer(false)}
                />
            )}
        </div>
    );
}
