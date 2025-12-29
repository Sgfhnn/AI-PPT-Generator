'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
    slideNumber: number;
    title: string;
    content: string[];
    notes?: string;
    layout: string;
}

interface PresentationViewerProps {
    slides: Slide[];
    theme: string;
    onClose: () => void;
}

const themeColors: Record<string, { bg: string; text: string; accent: string }> = {
    'dark-gradient': { bg: 'linear-gradient(135deg, #1e1e2e 0%, #2d2b55 100%)', text: '#ffffff', accent: '#6366f1' },
    'dark-minimal': { bg: '#18181b', text: '#f4f4f5', accent: '#00d4ff' },
    'dark-corporate': { bg: '#0f172a', text: '#f8fafc', accent: '#4ade80' },
    'dark-creative': { bg: '#2e1065', text: '#faf5ff', accent: '#f472b6' },
    'dark-tech': { bg: '#022c22', text: '#ecfdf5', accent: '#7ee787' },
};

export default function PresentationViewer({ slides, theme, onClose }: PresentationViewerProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);
    const [showControls, setShowControls] = useState(true);

    const colors = themeColors[theme] || themeColors['dark-gradient'];

    const handleNext = useCallback(() => {
        if (currentSlide < slides.length - 1) {
            setDirection(1);
            setCurrentSlide(prev => prev + 1);
        }
    }, [currentSlide, slides.length]);

    const handlePrev = useCallback(() => {
        if (currentSlide > 0) {
            setDirection(-1);
            setCurrentSlide(prev => prev - 1);
        }
    }, [currentSlide]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Space') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, onClose]);

    // Hide controls after inactivity
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 3000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeout);
        };
    }, []);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.8
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.8
        })
    };

    const slide = slides[currentSlide];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            style={{ background: '#000' }}
        >
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: colors.bg,
                        color: colors.text,
                        padding: '4rem'
                    }}
                >
                    <div style={{ maxWidth: '1200px', width: '100%' }}>
                        {slide.layout === 'title' ? (
                            <div style={{ textAlign: 'center' }}>
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '2rem', lineHeight: 1.1 }}
                                >
                                    {slide.title}
                                </motion.h1>
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    {slide.content.map((item, i) => (
                                        <p key={i} style={{ fontSize: '1.5rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                                            {item}
                                        </p>
                                    ))}
                                </motion.div>
                            </div>
                        ) : (
                            <div>
                                <motion.h2
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    style={{
                                        fontSize: '3rem',
                                        fontWeight: 'bold',
                                        marginBottom: '3rem',
                                        borderBottom: `2px solid ${colors.accent}`,
                                        paddingBottom: '1rem',
                                        display: 'inline-block'
                                    }}
                                >
                                    {slide.title}
                                </motion.h2>
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    {slide.content.map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 + (i * 0.1) }}
                                            style={{
                                                fontSize: '1.5rem',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '1rem'
                                            }}
                                        >
                                            <span style={{ color: colors.accent, marginTop: '0.2rem' }}>•</span>
                                            <span>{item}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showControls ? 1 : 0 }}
                style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '1rem',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10
                }}
            >
                <button
                    onClick={handlePrev}
                    disabled={currentSlide === 0}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
                    style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18L9 12L15 6" />
                    </svg>
                </button>
                <span style={{ color: 'white', display: 'flex', alignItems: 'center', minWidth: '60px', justifyContent: 'center' }}>
                    {currentSlide + 1} / {slides.length}
                </span>
                <button
                    onClick={handleNext}
                    disabled={currentSlide === slides.length - 1}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
                    style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18L15 12L9 6" />
                    </svg>
                </button>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem' }} />
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </motion.div>
        </div>
    );
}
