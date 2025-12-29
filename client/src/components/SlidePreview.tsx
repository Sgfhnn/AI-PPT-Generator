'use client';

import React from 'react';

interface Slide {
    slideNumber: number;
    title: string;
    content: string[];
    notes?: string;
    layout: string;
}

interface SlidePreviewProps {
    slides: Slide[];
    theme?: string;
    onSlideClick?: (index: number) => void;
    selectedIndex?: number;
}

const themeColors: Record<string, { bg: string; title: string; text: string; accent: string }> = {
    'dark-gradient': { bg: '#0f0f23', title: '#ffffff', text: '#e0e0e0', accent: '#6366f1' },
    'dark-minimal': { bg: '#1a1a2e', title: '#ffffff', text: '#c0c0c0', accent: '#00d4ff' },
    'dark-corporate': { bg: '#16213e', title: '#ffffff', text: '#d4d4d4', accent: '#4ade80' },
    'dark-creative': { bg: '#1e1e2f', title: '#ffffff', text: '#b8b8b8', accent: '#f472b6' },
    'dark-tech': { bg: '#0d1117', title: '#58a6ff', text: '#c9d1d9', accent: '#7ee787' },
};

export default function SlidePreview({ slides, theme = 'dark-gradient', onSlideClick, selectedIndex }: SlidePreviewProps) {
    const colors = themeColors[theme] || themeColors['dark-gradient'];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
        }}>
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className="slide-card"
                    onClick={() => onSlideClick?.(index)}
                    style={{
                        cursor: onSlideClick ? 'pointer' : 'default',
                        border: selectedIndex === index ? '2px solid var(--accent-primary)' : undefined,
                        background: colors.bg
                    }}
                >
                    <div className="slide-card-content" style={{ background: colors.bg }}>
                        {slide.layout === 'title' ? (
                            // Title slide layout
                            <div style={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    color: colors.title,
                                    marginBottom: '0.75rem'
                                }}>
                                    {slide.title}
                                </h3>
                                {slide.content[0] && (
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: colors.accent
                                    }}>
                                        {slide.content[0]}
                                    </p>
                                )}
                                <div style={{
                                    width: '40px',
                                    height: '2px',
                                    background: colors.accent,
                                    marginTop: '0.75rem',
                                    borderRadius: '1px'
                                }} />
                            </div>
                        ) : slide.layout === 'quote' ? (
                            // Quote slide layout
                            <div style={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                                padding: '0.5rem'
                            }}>
                                <span style={{
                                    fontSize: '2rem',
                                    color: colors.accent,
                                    opacity: 0.5,
                                    lineHeight: 1
                                }}>"</span>
                                <p style={{
                                    fontSize: '0.8rem',
                                    color: colors.text,
                                    fontStyle: 'italic',
                                    lineHeight: 1.5
                                }}>
                                    {slide.content[0] || slide.title}
                                </p>
                            </div>
                        ) : (
                            // Standard content slide
                            <>
                                <h3 className="slide-card-title" style={{ color: colors.title }}>
                                    {slide.title}
                                </h3>
                                <div style={{
                                    width: '24px',
                                    height: '2px',
                                    background: colors.accent,
                                    marginBottom: '0.75rem',
                                    borderRadius: '1px'
                                }} />
                                <ul className="slide-card-bullets">
                                    {slide.content.slice(0, 4).map((item, i) => (
                                        <li key={i} style={{ color: colors.text }}>
                                            <span style={{ color: colors.accent }}>•</span> {item.length > 50 ? item.substring(0, 50) + '...' : item}
                                        </li>
                                    ))}
                                    {slide.content.length > 4 && (
                                        <li style={{ color: colors.accent, fontStyle: 'italic' }}>
                                            +{slide.content.length - 4} more...
                                        </li>
                                    )}
                                </ul>
                            </>
                        )}
                    </div>
                    <div className="slide-card-number">
                        Slide {slide.slideNumber}
                    </div>
                </div>
            ))}
        </div>
    );
}
