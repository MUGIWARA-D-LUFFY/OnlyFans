'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import PostCard from '../../components/PostCard';
import CreatePostModal from '../../components/CreatePostModal';
import { usePostStore } from '../../store/post.store';
import { useUserStore } from '../../store/user.store';
import { useAuthGuard } from '../../utils/authGuard';
import api from '../../services/api';
import Link from 'next/link';

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
  _count: {
    posts: number;
    subscriptions: number;
  };
}

// Icons for the UI
const Icons = {
  image: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  ),
  video: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"></polygon>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
    </svg>
  ),
  bookmark: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  text: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7"></polyline>
      <line x1="9" y1="20" x2="15" y2="20"></line>
      <line x1="12" y1="4" x2="12" y2="20"></line>
    </svg>
  ),
  search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  filter: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"></line>
      <line x1="4" y1="10" x2="4" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12" y2="3"></line>
      <line x1="20" y1="21" x2="20" y2="16"></line>
      <line x1="20" y1="12" x2="20" y2="3"></line>
      <line x1="1" y1="14" x2="7" y2="14"></line>
      <line x1="9" y1="8" x2="15" y2="8"></line>
      <line x1="17" y1="16" x2="23" y2="16"></line>
    </svg>
  ),
  refresh: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"></polyline>
      <polyline points="1 20 1 14 7 14"></polyline>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
  ),
  chevronLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  chevronRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  moreHorizontal: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
      <circle cx="5" cy="12" r="1"></circle>
    </svg>
  ),
  moreVertical: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="12" cy="5" r="1"></circle>
      <circle cx="12" cy="19" r="1"></circle>
    </svg>
  ),
  verified: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#00aeef" stroke="white" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="9 12 11 14 15 10" stroke="white" fill="none"></polyline>
    </svg>
  ),
  pencil: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  )
};

export default function FeedPage() {
  const { user, isLoading: authLoading } = useAuthGuard(true);
  const { posts, isLoading, fetchFeed } = usePostStore();
  const { profile, fetchProfile } = useUserStore();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.ageVerified) {
      fetchFeed();
      fetchProfile();
      loadCreators();
    }
  }, [user, fetchFeed, fetchProfile]);

  const loadCreators = async () => {
    try {
      const response = await api.get('/creators');
      setCreators(response.data);
    } catch (error) {
      console.error('Failed to load creators:', error);
    } finally {
      setLoadingCreators(false);
    }
  };

  const handleRefreshCreators = async () => {
    setLoadingCreators(true);
    await loadCreators();
  };

  const handlePostCreated = () => {
    fetchFeed();
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(query) ||
      post.creator.user.username.toLowerCase().includes(query)
    );
  });

  const nextSuggestion = () => {
    if (creators.length > 0) {
      setSuggestionIndex((prev) => (prev + 1) % creators.length);
    }
  };

  const prevSuggestion = () => {
    if (creators.length > 0) {
      setSuggestionIndex((prev) => (prev - 1 + creators.length) % creators.length);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa' }}>
        <Navbar />
        <main style={{ marginLeft: '260px', padding: '24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ color: '#8a96a3', fontSize: '16px' }}>Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Navbar />
      <main style={{ marginLeft: '260px', display: 'flex', justifyContent: 'center', gap: '24px', padding: '0 24px' }}>
        {/* Main Content Area */}
        <div style={{ flex: 1, maxWidth: '640px', minWidth: '0' }}>
          {/* HOME Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 0',
            borderBottom: '1px solid #eaeaea'
          }}>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              HOME
            </h1>
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {Icons.moreVertical()}
            </button>
          </div>

          {/* Compose New Post Area */}
          <div
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'white',
              borderRadius: '0',
              padding: '16px 0',
              borderBottom: '1px solid #eaeaea',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                color: '#8a96a3',
                background: 'transparent',
                padding: '8px 0'
              }}
            >
              Compose new post...
            </div>

            {/* Action Icons */}
            <div style={{
              display: 'flex',
              gap: '20px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #eaeaea'
            }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}>
                {Icons.image()}
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}>
                {Icons.video()}
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}>
                {Icons.bookmark()}
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}>
                {Icons.text()}
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '16px 0',
            borderBottom: '1px solid #eaeaea'
          }}>
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: 'none',
                background: activeFilter === 'all' ? '#00aeef' : 'transparent',
                color: activeFilter === 'all' ? 'white' : '#1a1a2e',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('edit')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: activeFilter === 'edit' ? '#00aeef' : 'transparent',
                color: activeFilter === 'edit' ? 'white' : '#8a96a3',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {Icons.pencil()}
            </button>
          </div>

          {/* Feed Posts */}
          <div style={{ paddingTop: '16px' }}>
            {filteredPosts.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px solid #eaeaea'
              }}>
                <p style={{ color: '#8a96a3', fontSize: '16px', margin: 0 }}>
                  {searchQuery ? 'No posts match your search.' : 'No posts available. Subscribe to creators to see their content.'}
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
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
                  fontSize: '16px',
                  padding: '0 4px'
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Suggestions Section */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#8a96a3',
                textTransform: 'uppercase',
                margin: 0,
                letterSpacing: '0.5px'
              }}>
                SUGGESTIONS
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                <button
                  onClick={handleRefreshCreators}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {Icons.refresh()}
                </button>
                <button
                  onClick={prevSuggestion}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {Icons.chevronLeft()}
                </button>
                <button
                  onClick={nextSuggestion}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {Icons.chevronRight()}
                </button>
              </div>
            </div>

            {/* Suggestion Cards */}
            {loadingCreators ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: '#8a96a3', fontSize: '14px' }}>Loading suggestions...</p>
              </div>
            ) : creators.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {creators.slice(suggestionIndex, suggestionIndex + 3).map((creator) => (
                  <Link
                    key={creator.id}
                    href={`/profile/${creator.user.username}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      height: '100px',
                      background: creator.coverImageUrl
                        ? `url(${creator.coverImageUrl}) center/cover`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      cursor: 'pointer'
                    }}>
                      {/* Dark overlay */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)'
                      }} />

                      {/* Free Badge */}
                      {creator.subscriptionFee === 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600
                        }}>
                          Free
                        </div>
                      )}

                      {/* More button */}
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                          <circle cx="12" cy="5" r="2"></circle>
                          <circle cx="12" cy="12" r="2"></circle>
                          <circle cx="12" cy="19" r="2"></circle>
                        </svg>
                      </button>

                      {/* Creator Info */}
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        {/* Avatar */}
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          border: '2px solid white',
                          overflow: 'hidden',
                          background: creator.user.avatarUrl
                            ? `url(${creator.user.avatarUrl}) center/cover`
                            : '#00aeef',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '18px'
                        }}>
                          {!creator.user.avatarUrl && (creator.user.username?.[0]?.toUpperCase() || 'C')}
                        </div>

                        {/* Name and Username */}
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '14px'
                          }}>
                            {creator.user.username}
                            {creator.verified && Icons.verified()}
                          </div>
                          <div style={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '12px'
                          }}>
                            @{creator.user.username}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px solid #eaeaea'
              }}>
                <p style={{ color: '#8a96a3', fontSize: '14px', margin: 0 }}>
                  No creators available yet.
                </p>
              </div>
            )}

            {/* Pagination Dots */}
            {creators.length > 3 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '16px'
              }}>
                {Array.from({ length: Math.ceil(creators.length / 3) }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: Math.floor(suggestionIndex / 3) === i ? '#00aeef' : '#d0d0d0'
                    }}
                  />
                ))}
              </div>
            )}
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
      </main>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
        creatorId={profile?.creator?.id}
      />
    </div>
  );
}
