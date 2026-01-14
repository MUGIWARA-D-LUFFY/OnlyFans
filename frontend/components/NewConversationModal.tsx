'use client';

import { useState } from 'react';
import api from '../services/api';
import { subscriptionService } from '../services/subscription.service';

interface Creator {
    id: string;
    user: {
        id: string;
        username: string;
        avatarUrl?: string;
    };
}

interface NewConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConversationStarted: (userId: string) => void;
}

export default function NewConversationModal({ isOpen, onClose, onConversationStarted }: NewConversationModalProps) {
    const [creators, setCreators] = useState<Creator[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasLoaded, setHasLoaded] = useState(false);

    const loadSubscribedCreators = async () => {
        if (hasLoaded) return;
        setIsLoading(true);
        try {
            const subscriptions = await subscriptionService.getUserSubscriptions();
            // Extract unique creators from subscriptions
            const creatorList = subscriptions.map((sub: any) => sub.creator).filter(Boolean);
            setCreators(creatorList);
            setHasLoaded(true);
        } catch (error) {
            console.error('Failed to load creators:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load when modal opens
    if (isOpen && !hasLoaded) {
        loadSubscribedCreators();
    }

    if (!isOpen) return null;

    const filteredCreators = creators.filter((creator) =>
        creator.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
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
                maxWidth: '400px',
                maxHeight: '80vh',
                overflow: 'hidden',
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
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>New Conversation</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '20px',
                            color: '#666'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Search */}
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #eaeaea' }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search creators..."
                        style={{
                            width: '100%',
                            padding: '10px 16px',
                            border: '1px solid #eaeaea',
                            borderRadius: '25px',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Creator List */}
                <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8a96a3' }}>
                            Loading...
                        </div>
                    ) : filteredCreators.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8a96a3' }}>
                            {creators.length === 0
                                ? 'Subscribe to creators to message them'
                                : 'No creators match your search'}
                        </div>
                    ) : (
                        filteredCreators.map((creator) => (
                            <button
                                key={creator.id}
                                onClick={() => {
                                    onConversationStarted(creator.user.id);
                                    onClose();
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    width: '100%',
                                    padding: '12px 20px',
                                    border: 'none',
                                    background: 'white',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: creator.user.avatarUrl
                                        ? `url(${creator.user.avatarUrl}) center/cover`
                                        : '#00aeef',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}>
                                    {!creator.user.avatarUrl && creator.user.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>
                                        {creator.user.username}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#8a96a3' }}>
                                        @{creator.user.username}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
