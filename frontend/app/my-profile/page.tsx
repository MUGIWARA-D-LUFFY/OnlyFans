'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import PostCard from '../../components/PostCard';
import { useAuthGuard } from '../../utils/authGuard';
import { useUserStore } from '../../store/user.store';
import api from '../../services/api';
import Link from 'next/link';
import { getEmbedUrl } from '../../utils/imageUtils';

// Icons
const Icons = {
    back: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    ),
    moreVertical: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
        </svg>
    ),
    settings: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
    ),
    share: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
    ),
    close: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    ),
    search: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    ),
    emptyPosts: () => (
        <svg width="100" height="100" viewBox="0 0 120 120" fill="none">
            <rect x="15" y="30" width="50" height="40" rx="4" fill="#e8e8e8" transform="rotate(-15 15 30)" />
            <rect x="35" y="25" width="50" height="40" rx="4" fill="#f0f0f0" />
            <rect x="55" y="30" width="50" height="40" rx="4" fill="#e8e8e8" transform="rotate(15 55 30)" />
            <circle cx="60" cy="65" r="8" fill="#d0d0d0" />
            <rect x="45" y="80" width="30" height="5" rx="2" fill="#d0d0d0" />
        </svg>
    )
};

export default function MyProfilePage() {
    const { user, isLoading: authLoading } = useAuthGuard(true);
    const { profile, fetchProfile } = useUserStore();
    const [posts, setPosts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'posts' | 'media'>('posts');
    const [isLoading, setIsLoading] = useState(true);
    const [availabilityStatus, setAvailabilityStatus] = useState('Available');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user, fetchProfile]);

    useEffect(() => {
        if (profile?.creator?.id) {
            loadPosts();
        } else {
            setIsLoading(false);
        }
    }, [profile?.creator?.id]);

    const loadPosts = async () => {
        if (!profile?.creator?.id) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/posts/creator/${profile.creator.id}`);
            setPosts(response.data.posts || []);
        } catch (error) {
            console.error('Failed to load posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter posts based on search
    const filteredPosts = posts.filter((post) => {
        if (!searchQuery.trim()) return true;
        return post.title?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Get media posts
    const mediaPosts = filteredPosts.filter((post) => post.mediaUrl);

    if (authLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#fafafa' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', padding: '0 24px', gap: '24px' }}>
                    <Navbar />
                    <div style={{ flex: 1, maxWidth: '600px', paddingLeft: '24px' }}>
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <p style={{ color: '#8a96a3', fontSize: '16px' }}>Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#fafafa' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', padding: '0 24px', gap: '24px' }}>
                <Navbar />
                <div style={{ flex: 1, maxWidth: '600px', paddingLeft: '24px' }}>
                    {/* Main Content */}
                    <div style={{ flex: 1, maxWidth: '640px', minWidth: '0' }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px 0',
                            borderBottom: '1px solid #eaeaea',
                            background: '#fafafa'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Link href="/feed" style={{ color: '#1a1a2e', display: 'flex', alignItems: 'center' }}>
                                    {Icons.back()}
                                </Link>
                                <h1 style={{
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#1a1a2e',
                                    margin: 0
                                }}>
                                    {profile?.username || 'My Profile'}
                                </h1>
                            </div>
                            <button style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {Icons.moreVertical()}
                            </button>
                        </div>

                        {/* Cover Image */}
                        <div style={{
                            position: 'relative',
                            height: '180px',
                            background: profile?.creator?.coverImageUrl
                                ? `url(${getEmbedUrl(profile.creator.coverImageUrl)}) center/cover`
                                : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                            borderRadius: '0'
                        }}>
                            {/* Close button on cover */}
                            <button style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'rgba(0,0,0,0.5)',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {Icons.close()}
                            </button>
                        </div>

                        {/* Profile Info Section */}
                        <div style={{
                            background: 'white',
                            padding: '0 20px 20px',
                            borderBottom: '1px solid #eaeaea'
                        }}>
                            {/* Avatar and Actions Row */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                marginTop: '-40px'
                            }}>
                                {/* Avatar */}
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        border: '3px solid white',
                                        background: profile?.avatarUrl
                                            ? `url(${getEmbedUrl(profile.avatarUrl)}) center/cover`
                                            : '#ff4444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '24px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}>
                                        {!profile?.avatarUrl && (profile?.username?.[0]?.toUpperCase() || 'U')}
                                    </div>
                                    {/* Online indicator */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '4px',
                                        right: '4px',
                                        width: '14px',
                                        height: '14px',
                                        borderRadius: '50%',
                                        background: '#22c55e',
                                        border: '2px solid white'
                                    }} />
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '8px', paddingBottom: '8px' }}>
                                    <Link
                                        href="/settings"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: '1px solid #00aeef',
                                            background: 'white',
                                            color: '#00aeef',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {Icons.settings()}
                                        EDIT PROFILE
                                    </Link>
                                    <button style={{
                                        padding: '8px 12px',
                                        borderRadius: '20px',
                                        border: '1px solid #ddd',
                                        background: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        {Icons.share()}
                                    </button>
                                </div>
                            </div>

                            {/* Name and Username */}
                            <div style={{ marginTop: '12px' }}>
                                <h2 style={{
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: '#1a1a2e',
                                    margin: 0,
                                    marginBottom: '4px'
                                }}>
                                    {profile?.username || 'User'}
                                </h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', color: '#8a96a3' }}>
                                        @{profile?.username || 'user'}
                                    </span>
                                    <span style={{ color: '#ddd' }}>·</span>
                                    {/* Availability Status Dropdown */}
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                color: '#8a96a3',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            {availabilityStatus}
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </button>
                                        {showStatusDropdown && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                background: 'white',
                                                border: '1px solid #eaeaea',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                zIndex: 100,
                                                minWidth: '150px'
                                            }}>
                                                {['Available', 'Busy', 'Away', 'Do not disturb'].map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => {
                                                            setAvailabilityStatus(status);
                                                            setShowStatusDropdown(false);
                                                        }}
                                                        style={{
                                                            display: 'block',
                                                            width: '100%',
                                                            padding: '10px 16px',
                                                            border: 'none',
                                                            background: availabilityStatus === status ? '#f0f8ff' : 'white',
                                                            textAlign: 'left',
                                                            fontSize: '14px',
                                                            cursor: 'pointer',
                                                            color: '#1a1a2e'
                                                        }}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Posts/Media Tabs */}
                        <div style={{
                            display: 'flex',
                            background: 'white',
                            borderBottom: '1px solid #eaeaea'
                        }}>
                            <button
                                onClick={() => setActiveTab('posts')}
                                style={{
                                    flex: 1,
                                    padding: '14px 20px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === 'posts' ? '2px solid #1a1a2e' : '2px solid transparent',
                                    color: activeTab === 'posts' ? '#1a1a2e' : '#8a96a3',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {posts.length} POSTS
                            </button>
                            <button
                                onClick={() => setActiveTab('media')}
                                style={{
                                    flex: 1,
                                    padding: '14px 20px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === 'media' ? '2px solid #1a1a2e' : '2px solid transparent',
                                    color: activeTab === 'media' ? '#1a1a2e' : '#8a96a3',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase'
                                }}
                            >
                                NO MEDIA
                            </button>
                        </div>

                        {/* Posts Content */}
                        <div style={{ padding: '20px 0', background: 'white', minHeight: '300px' }}>
                            {activeTab === 'posts' ? (
                                isLoading ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#8a96a3' }}>
                                        Loading posts...
                                    </div>
                                ) : filteredPosts.length === 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '40px 20px',
                                        textAlign: 'center'
                                    }}>
                                        {Icons.emptyPosts()}
                                        <p style={{
                                            color: '#8a96a3',
                                            fontSize: '15px',
                                            marginTop: '16px'
                                        }}>
                                            {searchQuery ? 'No posts match your search' : 'No posts yet'}
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        {filteredPosts.map((post: any) => (
                                            <PostCard key={post.id} post={post} />
                                        ))}
                                    </div>
                                )
                            ) : (
                                // Media Tab
                                mediaPosts.length === 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '40px 20px',
                                        textAlign: 'center'
                                    }}>
                                        {Icons.emptyPosts()}
                                        <p style={{
                                            color: '#8a96a3',
                                            fontSize: '15px',
                                            marginTop: '16px'
                                        }}>
                                            No media yet
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '4px',
                                        padding: '0 20px'
                                    }}>
                                        {mediaPosts.map((post: any) => (
                                            <div
                                                key={post.id}
                                                style={{
                                                    aspectRatio: '1',
                                                    background: `url(${post.mediaUrl}) center/cover`,
                                                    cursor: 'pointer',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ width: '320px', flexShrink: 0, paddingTop: '20px' }}>
                        {/* Search Box */}
                        <div style={{
                            background: 'white',
                            borderRadius: '30px',
                            padding: '12px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: '1px solid #eaeaea',
                            marginBottom: '24px'
                        }}>
                            {Icons.search()}
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search posts"
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    flex: 1,
                                    fontSize: '14px',
                                    color: '#1a1a2e',
                                    background: 'transparent'
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#8a96a3',
                                        fontSize: '16px'
                                    }}
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {/* Spotify Integration */}
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid #eaeaea',
                            marginBottom: '24px'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '12px'
                            }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>SPOTIFY</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2">
                                    <polyline points="18 15 12 9 6 15"></polyline>
                                </svg>
                            </div>
                            <button style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '25px',
                                border: 'none',
                                background: '#1DB954',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                                SIGN IN WITH SPOTIFY
                            </button>
                        </div>

                        {/* Footer Links */}
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: '#8a96a3'
                        }}>
                            <a href="#" style={{ color: '#8a96a3', textDecoration: 'none' }}>Privacy</a>
                            <span>·</span>
                            <a href="#" style={{ color: '#8a96a3', textDecoration: 'none' }}>Cookie Notice</a>
                            <span>·</span>
                            <a href="#" style={{ color: '#8a96a3', textDecoration: 'none' }}>Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

