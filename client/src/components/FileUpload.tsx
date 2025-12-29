'use client';

import React, { useState, useRef, useCallback } from 'react';

// SVG Icons
const UploadIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" />
        <path d="M17 8L12 3L7 8" />
        <path d="M12 3V15" />
    </svg>
);

const FileIcon = ({ type }: { type: string }) => {
    const colors: Record<string, string> = {
        pdf: '#ef4444',
        docx: '#3b82f6',
        doc: '#3b82f6',
        txt: '#22c55e'
    };

    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors[type] || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" />
            <path d="M14 2V8H20" />
        </svg>
    );
};

const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18" />
        <path d="M6 6L18 18" />
    </svg>
);

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
    onRemove: () => void;
    isLoading?: boolean;
}

export default function FileUpload({ onFileSelect, selectedFile, onRemove, isLoading }: FileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (isValidFile(file)) {
                onFileSelect(file);
            }
        }
    }, [onFileSelect]);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (isValidFile(file)) {
                onFileSelect(file);
            }
        }
    };

    const isValidFile = (file: File) => {
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain'
        ];
        const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();

        return validTypes.includes(file.type) || validExtensions.includes(ext);
    };

    const getFileType = (filename: string) => {
        return filename.split('.').pop()?.toLowerCase() || 'unknown';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (selectedFile) {
        const fileType = getFileType(selectedFile.name);

        return (
            <div style={{
                background: 'var(--surface-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FileIcon type={fileType} />
                    <div>
                        <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                            {selectedFile.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            {formatFileSize(selectedFile.size)} • {fileType.toUpperCase()}
                        </div>
                    </div>
                </div>

                {!isLoading && (
                    <button
                        onClick={onRemove}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
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
                        <XIcon />
                    </button>
                )}

                {isLoading && (
                    <div className="spinner" />
                )}
            </div>
        );
    }

    return (
        <div
            className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            <div className="upload-zone-icon">
                <UploadIcon />
            </div>

            <p className="upload-zone-text">
                <strong>Click to upload</strong> or drag and drop
            </p>

            <p className="upload-zone-hint">
                PDF, Word (.docx, .doc), or Text files up to 10MB
            </p>
        </div>
    );
}
