'use client';

import { useState, useRef } from 'react';
import api from '../services/api';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
    creatorId?: string;
}

const Icons = {
    close: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    ),
    image: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
    ),
    video: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
    ),
    dollar: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
    )
};

export default function CreatePostModal({ isOpen, onClose, onPostCreated, creatorId }: CreatePostModalProps) {
    const [title, setTitle] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [isPaid, setIsPaid] = useState(false);
    const [price, setPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showMediaInput, setShowMediaInput] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Please enter some content for your post');
            return;
        }

        if (!creatorId) {
            setError('You need a creator profile to post. Please set up your creator profile first.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await api.post(`/posts/creator/${creatorId}`, {
                title: title.trim(),
                mediaUrl: mediaUrl || 'https://picsum.photos/800/600',
                mediaType,
                isPaid,
                price: isPaid ? parseFloat(price) : undefined
            });

            // Reset form
            setTitle('');
            setMediaUrl('');
            setMediaType('image');
            setIsPaid(false);
            setPrice('');
            setShowMediaInput(false);

            onPostCreated();
            onClose();
        } catch (err: any) {
            console.error('Failed to create post:', err);
            setError(err.response?.data?.message || 'Failed to create post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setMediaUrl('');
        setMediaType('image');
        setIsPaid(false);
        setPrice('');
        setError('');
        setShowMediaInput(false);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'white',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflow: 'auto',
                zIndex: 1001,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: '1px solid #eaeaea'
                }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Create New Post</h2>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: '#666'
                        }}
                    >
                        {Icons.close()}
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            borderRadius: '8px',
                            fontSize: '14px',
                            marginBottom: '16px'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Content Textarea */}
                    <div style={{ marginBottom: '16px' }}>
                        <textarea
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What's on your mind?"
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '16px',
                                border: '1px solid #eaeaea',
                                borderRadius: '12px',
                                fontSize: '16px',
                                resize: 'vertical',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    {/* Media Input */}
                    {showMediaInput && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#666' }}>
                                Media URL
                            </label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setMediaType('image')}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: mediaType === 'image' ? '2px solid #00aeef' : '1px solid #ddd',
                                        background: mediaType === 'image' ? '#f0f9ff' : 'white',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 500
                                    }}
                                >
                                    Image
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMediaType('video')}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: mediaType === 'video' ? '2px solid #00aeef' : '1px solid #ddd',
                                        background: mediaType === 'video' ? '#f0f9ff' : 'white',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 500
                                    }}
                                >
                                    Video
                                </button>
                            </div>
                            <input
                                type="url"
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #eaeaea',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                            {mediaUrl && mediaType === 'image' && (
                                <div style={{ marginTop: '8px' }}>
                                    <img
                                        src={mediaUrl}
                                        alt="Preview"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '200px',
                                            borderRadius: '8px',
                                            objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Paid Content */}
                    {isPaid && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#666' }}>
                                Price ($)
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="5.00"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #eaeaea',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid #eaeaea',
                        marginBottom: '20px'
                    }}>
                        <button
                            type="button"
                            onClick={() => setShowMediaInput(!showMediaInput)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                border: showMediaInput ? '2px solid #00aeef' : '1px solid #ddd',
                                borderRadius: '25px',
                                background: showMediaInput ? '#f0f9ff' : 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#666'
                            }}
                        >
                            {Icons.image()}
                            Media
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsPaid(!isPaid)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                border: isPaid ? '2px solid #00aeef' : '1px solid #ddd',
                                borderRadius: '25px',
                                background: isPaid ? '#f0f9ff' : 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#666'
                            }}
                        >
                            {Icons.dollar()}
                            Paid
                        </button>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !title.trim()}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '25px',
                            border: 'none',
                            background: title.trim() ? '#00aeef' : '#e0e0e0',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: title.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                    >
                        {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                </form>
            </div>
        </>
    );
}
