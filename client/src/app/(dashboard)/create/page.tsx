'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateApi } from '@/lib/api';
import FileUpload from '@/components/FileUpload';
import SlidePreview from '@/components/SlidePreview';

// Icons
const TextIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" />
        <path d="M14 2V8H20" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
    </svg>
);

const UploadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" />
        <path d="M17 8L12 3L7 8" />
        <path d="M12 3V15" />
    </svg>
);

const SparklesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" />
        <path d="M7 10L12 15L17 10" />
        <path d="M12 15V3" />
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
    slides: Slide[];
    theme: string;
}

const themes = [
    { id: 'dark-gradient', name: 'Gradient', color: '#6366f1' },
    { id: 'dark-minimal', name: 'Minimal', color: '#00d4ff' },
    { id: 'dark-corporate', name: 'Corporate', color: '#4ade80' },
    { id: 'dark-creative', name: 'Creative', color: '#f472b6' },
    { id: 'dark-tech', name: 'Tech', color: '#7ee787' },
];

function CreatePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialMode = searchParams.get('mode') || 'text';

    const [mode, setMode] = useState<'text' | 'file'>(initialMode as 'text' | 'file');
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [slideCount, setSlideCount] = useState(8);
    const [theme, setTheme] = useState('dark-gradient');
    const [file, setFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [generatedPresentation, setGeneratedPresentation] = useState<Presentation | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleGenerate = async () => {
        setError('');

        if (mode === 'text' && content.trim().length < 50) {
            setError('Please enter at least 50 characters of content');
            return;
        }

        if (mode === 'file' && !file) {
            setError('Please upload a file');
            return;
        }

        setIsGenerating(true);

        try {
            let response;

            if (mode === 'text') {
                response = await generateApi.fromText({
                    content,
                    title: title || undefined,
                    slideCount,
                    theme
                });
            } else {
                const formData = new FormData();
                formData.append('file', file!);
                formData.append('slideCount', slideCount.toString());
                formData.append('theme', theme);
                if (title) formData.append('title', title);

                response = await generateApi.fromFile(formData);
            }

            if (response.success && response.data) {
                const data = response.data as { presentation: Presentation };
                setGeneratedPresentation(data.presentation);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate presentation');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExport = async () => {
        if (!generatedPresentation) return;

        setIsExporting(true);
        try {
            const { presentationsApi } = await import('@/lib/api');
            const response = await presentationsApi.export(generatedPresentation._id);

            if (response.success && response.data) {
                const data = response.data as { downloadUrl: string };
                // Download the file
                const downloadUrl = presentationsApi.getDownloadUrl(generatedPresentation._id);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `${generatedPresentation.title}.pptx`;
                link.target = '_blank';

                // Add auth token to request
                const token = localStorage.getItem('token');
                if (token) {
                    // Use fetch with auth headers for download
                    const res = await fetch(downloadUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to export');
        } finally {
            setIsExporting(false);
        }
    };

    const handleNewPresentation = () => {
        setGeneratedPresentation(null);
        setContent('');
        setTitle('');
        setFile(null);
    };

    if (generatedPresentation) {
        return (
            <div className="fade-in">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{generatedPresentation.title}</h1>
                        <p className="page-subtitle">
                            {generatedPresentation.slides.length} slides generated
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={handleNewPresentation} className="btn btn-secondary">
                            Create Another
                        </button>
                        <button onClick={handleExport} className="btn btn-primary" disabled={isExporting}>
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

                <SlidePreview
                    slides={generatedPresentation.slides}
                    theme={generatedPresentation.theme}
                />
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Create Presentation</h1>
                    <p className="page-subtitle">
                        Transform your content into a beautiful presentation
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: '800px' }}>
                {/* Mode Tabs */}
                <div className="tabs" style={{ marginBottom: '2rem' }}>
                    <button
                        className={`tab ${mode === 'text' ? 'active' : ''}`}
                        onClick={() => setMode('text')}
                    >
                        <TextIcon /> From Text
                    </button>
                    <button
                        className={`tab ${mode === 'file' ? 'active' : ''}`}
                        onClick={() => setMode('file')}
                    >
                        <UploadIcon /> From File
                    </button>
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

                {/* Content Input */}
                <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
                        {mode === 'text' ? '1. Enter Your Content' : '1. Upload Your File'}
                    </h3>

                    {mode === 'text' ? (
                        <div className="input-group">
                            <textarea
                                className="input textarea"
                                placeholder="Paste your text content here... (minimum 50 characters)

Example: An introduction to machine learning covering supervised learning, unsupervised learning, neural networks, and practical applications in business."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{ minHeight: '200px' }}
                            />
                            <div style={{
                                textAlign: 'right',
                                fontSize: '0.8rem',
                                color: content.length < 50 ? 'var(--text-muted)' : 'var(--success)',
                                marginTop: '0.5rem'
                            }}>
                                {content.length} characters
                            </div>
                        </div>
                    ) : (
                        <FileUpload
                            onFileSelect={setFile}
                            selectedFile={file}
                            onRemove={() => setFile(null)}
                            isLoading={isGenerating}
                        />
                    )}
                </div>

                {/* Options */}
                <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
                        2. Customize Options
                    </h3>

                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        <div className="input-group">
                            <label className="input-label">Presentation Title (optional)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="AI will generate a title if left empty"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Number of Slides</label>
                            <select
                                className="select"
                                value={slideCount}
                                onChange={(e) => setSlideCount(parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            >
                                <option value="5">5 slides</option>
                                <option value="8">8 slides</option>
                                <option value="10">10 slides</option>
                                <option value="12">12 slides</option>
                                <option value="15">15 slides</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Theme</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                                {themes.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTheme(t.id)}
                                        className={`theme-option ${theme === t.id ? 'selected' : ''}`}
                                        style={{ justifyContent: 'flex-start' }}
                                    >
                                        <div
                                            className="theme-preview"
                                            style={{ background: t.color, width: '24px', height: '24px' }}
                                        />
                                        <span className="theme-name">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <div className="spinner" style={{ width: '20px', height: '20px' }} />
                            Generating with AI...
                        </>
                    ) : (
                        <>
                            <SparklesIcon />
                            Generate Presentation
                        </>
                    )}
                </button>

                {isGenerating && (
                    <div style={{
                        textAlign: 'center',
                        marginTop: '1.5rem',
                        padding: '2rem',
                        background: 'var(--surface-glass)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-glass)'
                    }}>
                        <div className="loading-dots" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            AI is analyzing your content and creating slides...
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            This usually takes 10-20 seconds
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CreatePage() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        }>
            <CreatePageContent />
        </Suspense>
    );
}
