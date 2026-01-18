'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuthGuard } from '../../utils/authGuard';
import api from '../../services/api';
import * as postInteractions from '../../services/post-interactions.service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getEmbedUrl } from '../../utils/imageUtils';

interface Creator {
    id: string;
    bio: string;
    subscriptionFee: number;
    verified: boolean;
    coverImageUrl?: string;
    user: {
        id: string;
        username: string;
        avatarUrl?: string;
    };
    _count?: {
        posts: number;
        subscriptions: number;
    };
}

// Icons for the UI
const Icons = {
    back: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    ),
    search: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    ),
    plus: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    ),
    sort: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="12" x2="16" y2="12"></line>
            <line x1="4" y1="18" x2="12" y2="18"></line>
        </svg>
    ),
    pin: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
        </svg>
    ),
    moreVertical: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
        </svg>
    ),
    filter: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
    ),
    verified: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#00aeef" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="9 12 11 14 15 10" stroke="white" fill="none"></polyline>
        </svg>
    ),
    star: () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#00aeef" stroke="#00aeef" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    ),
    bookmark: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
    ),
    emptySearch: () => (
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
            <circle cx="40" cy="40" r="25" stroke="#e0e0e0" strokeWidth="4" fill="none" />
            <line x1="58" y1="58" x2="75" y2="75" stroke="#e0e0e0" strokeWidth="4" strokeLinecap="round" />
            <circle cx="65" cy="30" r="8" fill="#e0e0e0" />
            <circle cx="72" cy="45" r="5" fill="#e0e0e0" />
            <path d="M35 38 Q40 32 45 38" stroke="#d0d0d0" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
    )
};

// List category types
type ListCategory = 'all' | 'fans' | 'following' | 'restricted' | 'blocked';

interface ListItem {
    id: ListCategory;
    name: string;
}

export default function CollectionsPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuthGuard(true);
    const [activeMainTab, setActiveMainTab] = useState<'userLists' | 'bookmarks'>('userLists');
    const [activeDetailTab, setActiveDetailTab] = useState<'users' | 'posts'>('users');
    const [selectedList, setSelectedList] = useState<ListCategory>('all');
    const [creators, setCreators] = useState<Creator[]>([]);
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [loadingBookmarks, setLoadingBookmarks] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchInput, setShowSearchInput] = useState(false);

    // Standard list categories
    const listCategories: ListItem[] = [
        { id: 'all', name: 'All Creators' },
        { id: 'fans', name: 'Fans' },
        { id: 'following', name: 'Following' },
        { id: 'restricted', name: 'Restricted' },
        { id: 'blocked', name: 'Blocked' }
    ];

    useEffect(() => {
        if (user) {
            loadCreators();
        }
    }, [user]);

    // Load bookmarks when switching to bookmarks tab
    useEffect(() => {
        if (user && activeMainTab === 'bookmarks') {
            loadBookmarks();
        }
    }, [user, activeMainTab]);

    const loadBookmarks = async () => {
        setLoadingBookmarks(true);
        try {
            const data = await postInteractions.getBookmarks();
            setBookmarks(data);
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
        } finally {
            setLoadingBookmarks(false);
        }
    };

    const handleRemoveBookmark = async (postId: string) => {
        try {
            await postInteractions.removeBookmark(postId);
            setBookmarks((prev) => prev.filter((b) => b.postId !== postId));
        } catch (error) {
            console.error('Failed to remove bookmark:', error);
        }
    };

    const loadCreators = async () => {
        try {
            const response = await api.get('/creators');
            setCreators(response.data);
        } catch (error) {
            console.error('Failed to load creators:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getFilteredCreators = () => {
        let filtered = creators;

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(c =>
                c.user.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // For now, 'all' shows all creators, other categories would filter based on user relationships
        // This would be connected to real user relationship data from backend
        if (selectedList !== 'all') {
            // Return empty for categories that need backend support
            return [];
        }

        return filtered;
    };

    const getListCount = (listId: ListCategory) => {
        if (listId === 'all') return creators.length;
        // Other counts would come from backend user relationships
        return 0;
    };

    const getSelectedListName = () => {
        const list = listCategories.find(l => l.id === selectedList);
        return list?.name || 'Select a list';
    };

    if (authLoading || isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#fafafa' }}>
                <Navbar />
                <main style={{ marginLeft: '288px', padding: '24px' }}>
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <p style={{ color: '#8a96a3', fontSize: '16px' }}>Loading...</p>
                    </div>
                </main>
            </div>
        );
    }

    const filteredCreators = getFilteredCreators();

    return (
        <div style={{ minHeight: '100vh', background: '#fafafa' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', padding: '0 24px', gap: '24px' }}>
                <Navbar />
                <main style={{ flex: 1, display: 'flex', padding: '0' }}>
                    {/* Left Panel - Lists */}
                    <div style={{
                        width: '320px',
                        borderRight: '1px solid #eaeaea',
                        background: 'white',
                        minHeight: 'calc(100vh - 0px)'
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px 20px',
                            borderBottom: '1px solid #eaeaea'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button
                                    onClick={() => router.back()}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#1a1a2e',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '4px'
                                    }}
                                >
                                    {Icons.back()}
                                </button>
                                <h1 style={{
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: '#1a1a2e',
                                    margin: 0,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    COLLECTIONS
                                </h1>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setShowSearchInput(!showSearchInput)}
                                    style={{
                                        background: showSearchInput ? '#f0f0f0' : 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#1a1a2e'
                                    }}
                                >
                                    {Icons.search()}
                                </button>
                                <button style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#1a1a2e'
                                }}>
                                    {Icons.plus()}
                                </button>
                            </div>
                        </div>

                        {/* Search Input */}
                        {showSearchInput && (
                            <div style={{
                                padding: '12px 20px',
                                borderBottom: '1px solid #eaeaea'
                            }}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    autoFocus
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
                        )}

                        {/* Tabs */}
                        <div style={{
                            display: 'flex',
                            borderBottom: '1px solid #eaeaea'
                        }}>
                            <button
                                onClick={() => setActiveMainTab('userLists')}
                                style={{
                                    flex: 1,
                                    padding: '14px 20px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeMainTab === 'userLists' ? '2px solid #1a1a2e' : '2px solid transparent',
                                    color: activeMainTab === 'userLists' ? '#1a1a2e' : '#8a96a3',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                USER LISTS
                            </button>
                            <button
                                onClick={() => setActiveMainTab('bookmarks')}
                                style={{
                                    flex: 1,
                                    padding: '14px 20px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeMainTab === 'bookmarks' ? '2px solid #1a1a2e' : '2px solid transparent',
                                    color: activeMainTab === 'bookmarks' ? '#1a1a2e' : '#8a96a3',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                BOOKMARKS
                            </button>
                        </div>

                        {/* Custom Order Section */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 20px',
                            borderBottom: '1px solid #eaeaea'
                        }}>
                            <span style={{ fontSize: '12px', color: '#8a96a3', fontWeight: 500, textTransform: 'uppercase' }}>
                                CUSTOM ORDER
                            </span>
                            <button style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {Icons.sort()}
                            </button>
                        </div>

                        {/* List Items */}
                        <div>
                            {listCategories.map((list) => (
                                <div
                                    key={list.id}
                                    onClick={() => setSelectedList(list.id)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '14px 20px',
                                        cursor: 'pointer',
                                        background: selectedList === list.id ? '#f0f8ff' : 'transparent',
                                        borderLeft: selectedList === list.id ? '3px solid #00aeef' : '3px solid transparent',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div>
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            color: '#1a1a2e',
                                            marginBottom: '2px'
                                        }}>
                                            {list.name}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: getListCount(list.id) > 0 ? '#8a96a3' : '#00aeef'
                                        }}>
                                            {getListCount(list.id) > 0
                                                ? `${getListCount(list.id)} users`
                                                : 'empty'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel - Details */}
                    <div style={{ flex: 1, background: '#fafafa' }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px 24px',
                            background: 'white',
                            borderBottom: '1px solid #eaeaea'
                        }}>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                color: '#1a1a2e',
                                margin: 0,
                                textTransform: 'uppercase'
                            }}>
                                {getSelectedListName()}
                            </h2>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    {Icons.pin()}
                                </button>
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
                        </div>

                        {/* Tabs */}
                        <div style={{
                            display: 'flex',
                            background: 'white',
                            borderBottom: '1px solid #eaeaea'
                        }}>
                            <button
                                onClick={() => setActiveDetailTab('users')}
                                style={{
                                    flex: 1,
                                    padding: '14px 20px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeDetailTab === 'users' ? '2px solid #1a1a2e' : '2px solid transparent',
                                    color: activeDetailTab === 'users' ? '#1a1a2e' : '#8a96a3',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase'
                                }}
                            >
                                USERS
                            </button>
                            <button
                                onClick={() => setActiveDetailTab('posts')}
                                style={{
                                    flex: 1,
                                    padding: '14px 20px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeDetailTab === 'posts' ? '2px solid #1a1a2e' : '2px solid transparent',
                                    color: activeDetailTab === 'posts' ? '#1a1a2e' : '#8a96a3',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase'
                                }}
                            >
                                POSTS
                            </button>
                        </div>

                        {/* Content Area */}
                        <div style={{ padding: '16px 24px' }}>
                            {/* Section Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }}>
                                <span style={{ fontSize: '12px', color: '#8a96a3', fontWeight: 500, textTransform: 'uppercase' }}>
                                    DEFAULT
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        {Icons.search()}
                                    </button>
                                    <button style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        {Icons.filter()}
                                    </button>
                                    <button style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        {Icons.sort()}
                                    </button>
                                </div>
                            </div>

                            {/* User Cards */}
                            {filteredCreators.length > 0 ? (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: '16px'
                                }}>
                                    {filteredCreators.map((creator) => (
                                        <div
                                            key={creator.id}
                                            style={{
                                                background: 'white',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                border: '1px solid #eaeaea'
                                            }}
                                        >
                                            {/* Cover Image */}
                                            <div style={{
                                                height: '80px',
                                                background: creator.coverImageUrl
                                                    ? `url(${getEmbedUrl(creator.coverImageUrl)}) center/cover`
                                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                position: 'relative'
                                            }}>
                                                <button style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: 'white',
                                                    padding: '4px'
                                                }}>
                                                    {Icons.pin()}
                                                </button>
                                            </div>

                                            {/* User Info */}
                                            <div style={{ padding: '0 16px 16px', marginTop: '-24px' }}>
                                                {/* Avatar */}
                                                <div style={{
                                                    width: '56px',
                                                    height: '56px',
                                                    borderRadius: '50%',
                                                    border: '3px solid white',
                                                    background: creator.user.avatarUrl
                                                        ? `url(${getEmbedUrl(creator.user.avatarUrl)}) center/cover`
                                                        : '#00aeef',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '20px',
                                                    marginBottom: '8px'
                                                }}>
                                                    {!creator.user.avatarUrl && creator.user.username[0].toUpperCase()}
                                                </div>

                                                {/* Name */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e' }}>
                                                        {creator.user.username}
                                                    </span>
                                                    {creator.verified && Icons.verified()}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#8a96a3', marginBottom: '12px' }}>
                                                    @{creator.user.username}
                                                </div>

                                                {/* Stats */}
                                                {creator._count && (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        marginBottom: '12px',
                                                        fontSize: '12px',
                                                        color: '#8a96a3'
                                                    }}>
                                                        <span>{creator._count.posts} posts</span>
                                                        <span>·</span>
                                                        <span>{creator._count.subscriptions} subscribers</span>
                                                    </div>
                                                )}

                                                {/* Subscribe Button */}
                                                <Link
                                                    href={`/profile/${creator.user.username}`}
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '12px 16px',
                                                        background: '#00aeef',
                                                        border: 'none',
                                                        borderRadius: '25px',
                                                        cursor: 'pointer',
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    <span style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>
                                                        {creator.subscriptionFee === 0 ? 'FREE' : 'SUBSCRIBE'}
                                                    </span>
                                                    <span style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>
                                                        {creator.subscriptionFee === 0
                                                            ? 'Follow for free'
                                                            : `$${creator.subscriptionFee}/month`}
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add User Card */}
                                    <div style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        border: '1px dashed #ddd',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '280px',
                                        cursor: 'pointer'
                                    }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            border: '2px solid #ddd',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#8a96a3'
                                        }}>
                                            {Icons.plus()}
                                        </div>
                                    </div>
                                </div>
                            ) : filteredCreators.length === 0 && activeMainTab === 'bookmarks' ? (
                                /* Bookmarks View */
                                loadingBookmarks ? (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '60px 20px',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ color: '#8a96a3', fontSize: '15px' }}>Loading bookmarks...</p>
                                    </div>
                                ) : bookmarks.length === 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '80px 20px',
                                        textAlign: 'center'
                                    }}>
                                        {Icons.emptySearch()}
                                        <p style={{ color: '#8a96a3', fontSize: '15px', marginTop: '16px' }}>
                                            No bookmarks yet
                                        </p>
                                        <p style={{ color: '#8a96a3', fontSize: '13px', marginTop: '8px' }}>
                                            Save posts by clicking the bookmark icon on any post
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                        gap: '16px'
                                    }}>
                                        {bookmarks.map((bookmark) => (
                                            <div
                                                key={bookmark.id}
                                                style={{
                                                    background: 'white',
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    border: '1px solid #eaeaea',
                                                    position: 'relative'
                                                }}
                                            >
                                                {/* Remove bookmark button */}
                                                <button
                                                    onClick={() => handleRemoveBookmark(bookmark.postId)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '8px',
                                                        right: '8px',
                                                        background: 'rgba(0,0,0,0.5)',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '28px',
                                                        height: '28px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        color: 'white',
                                                        zIndex: 10
                                                    }}
                                                >
                                                    ×
                                                </button>
                                                {/* Thumbnail */}
                                                <div style={{
                                                    height: '160px',
                                                    background: bookmark.post?.mediaUrl
                                                        ? `url(${bookmark.post.mediaUrl}) center/cover`
                                                        : '#f0f0f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {!bookmark.post?.mediaUrl && <span style={{ fontSize: '32px' }}>📌</span>}
                                                </div>
                                                {/* Info */}
                                                <div style={{ padding: '12px' }}>
                                                    {bookmark.post?.title && (
                                                        <p style={{
                                                            fontSize: '14px',
                                                            color: '#1a1a2e',
                                                            margin: '0 0 4px',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {bookmark.post.title}
                                                        </p>
                                                    )}
                                                    {bookmark.post?.creator?.user?.username && (
                                                        <p style={{
                                                            fontSize: '12px',
                                                            color: '#00aeef',
                                                            margin: '0 0 4px'
                                                        }}>
                                                            @{bookmark.post.creator.user.username}
                                                        </p>
                                                    )}
                                                    <p style={{
                                                        fontSize: '12px',
                                                        color: '#8a96a3',
                                                        margin: 0
                                                    }}>
                                                        Saved {new Date(bookmark.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                /* Empty State */
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '80px 20px',
                                    textAlign: 'center'
                                }}>
                                    {Icons.emptySearch()}
                                    <p style={{
                                        color: '#8a96a3',
                                        fontSize: '15px',
                                        marginTop: '16px'
                                    }}>
                                        Nothing found
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

