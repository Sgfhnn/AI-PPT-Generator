'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// SVG Icons
const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
    <path d="M5 3L5.5 5L7 5.5L5.5 6L5 8L4.5 6L3 5.5L4.5 5L5 3Z" />
    <path d="M19 17L19.5 18.5L21 19L19.5 19.5L19 21L18.5 19.5L17 19L18.5 18.5L19 17Z" />
  </svg>
);

const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" />
    <path d="M17 8L12 3L7 8" />
    <path d="M12 3V15" />
  </svg>
);

const TextIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" />
    <path d="M14 2V8H20" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

const AIIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2V4" />
    <path d="M12 20V22" />
    <path d="M2 12H4" />
    <path d="M20 12H22" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" />
    <path d="M7 10L12 15L17 10" />
    <path d="M12 15V3" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12H19" />
    <path d="M12 5L19 12L12 19" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17L4 12" />
  </svg>
);

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <UploadIcon />,
      title: 'Multiple Input Sources',
      description: 'Upload PDFs, Word documents, or simply paste your text. Our system handles it all.'
    },
    {
      icon: <AIIcon />,
      title: 'AI-Powered Generation',
      description: 'Powered by Google Gemini AI to create intelligent, well-structured presentations.'
    },
    {
      icon: <TextIcon />,
      title: 'Beautiful Themes',
      description: 'Choose from multiple dark-mode themes designed for modern, professional look.'
    },
    {
      icon: <DownloadIcon />,
      title: 'Export to PPTX',
      description: 'Download your presentations as PowerPoint files ready for use.'
    }
  ];

  const benefits = [
    'Save hours of presentation creation time',
    'Professional layouts and designs',
    'AI-generated speaker notes',
    'Multiple export formats',
    'Edit and customize before export',
    'Secure and private processing'
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '1rem 2rem',
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'var(--accent-gradient)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <SparklesIcon />
            </div>
            <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              AI PPT Generator
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/login" className="btn btn-ghost">
              Login
            </Link>
            <Link href="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: 'clamp(6rem, 15vw, 8rem)',
        paddingBottom: 'clamp(3rem, 10vw, 6rem)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'pulse 4s ease-in-out infinite',
          animationDelay: '2s'
        }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem', position: 'relative' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--surface-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-full)',
            marginBottom: '2rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            <span style={{ color: 'var(--accent-primary)' }}>✨</span>
            AI-Powered Presentations
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '1.5rem',
            letterSpacing: '-0.03em'
          }}>
            Transform Your Ideas Into{' '}
            <span className="gradient-text">Stunning Presentations</span>
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
            lineHeight: '1.7'
          }}>
            Upload a document or paste your text, and let AI create beautiful,
            professional PowerPoint presentations in seconds.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Start Creating Free
              <ArrowRightIcon />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              View Demo
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '3rem',
            justifyContent: 'center',
            marginTop: '4rem',
            flexWrap: 'wrap'
          }}>
            {[
              { value: '10K+', label: 'Presentations Created' },
              { value: '5K+', label: 'Happy Users' },
              { value: '4.9', label: 'Average Rating' }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                  {stat.value}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: 'clamp(3rem, 8vw, 6rem) 2rem',
        background: 'var(--background-secondary)',
        borderTop: '1px solid var(--border-glass)',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
              Everything You Need
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              A complete solution for creating presentations from any content source
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem'
          }}>
            {features.map((feature, i) => (
              <div
                key={i}
                className="glass-card"
                style={{ padding: '2rem', textAlign: 'center' }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 1.5rem',
                  background: 'var(--surface-glass)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
              How It Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Three simple steps to your perfect presentation
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { step: '01', title: 'Input Content', desc: 'Paste text or upload your PDF/Word document' },
              { step: '02', title: 'AI Generates', desc: 'Our AI structures and designs your presentation' },
              { step: '03', title: 'Download', desc: 'Review, edit, and export to PowerPoint' }
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '4rem',
                  fontWeight: '800',
                  background: 'var(--accent-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  opacity: 0.3,
                  marginBottom: '-1rem'
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{
        padding: 'clamp(3rem, 8vw, 6rem) 2rem',
        background: 'var(--background-secondary)',
        borderTop: '1px solid var(--border-glass)',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '3rem' }}>
            Why Choose AI PPT Generator?
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            textAlign: 'left'
          }}>
            {benefits.map((benefit, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'var(--surface-glass)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-glass)'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                  flexShrink: 0
                }}>
                  <CheckIcon />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
            Ready to Create?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Join thousands of users creating stunning presentations with AI
          </p>
          <Link href="/register" className="btn btn-primary btn-lg">
            Get Started Free
            <ArrowRightIcon />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        borderTop: '1px solid var(--border-glass)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.875rem'
      }}>
        <p>© 2024 AI PPT Generator. Built with ❤️ using Next.js</p>
      </footer>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
