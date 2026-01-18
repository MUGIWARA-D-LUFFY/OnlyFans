'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import PostCard from '../../../components/PostCard';
import api from '../../../services/api';
import { postService } from '../../../services/post.service';
import { subscriptionService } from '../../../services/subscription.service';
import { paymentService } from '../../../services/payment.service';
import { useAuthGuard } from '../../../utils/authGuard';

// Helper to convert Google Drive view links to direct embed links
const getEmbedUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=s2000`;
    }
  }
  return url;
};

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuthGuard(true);
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Interactive state
  const [activeTab, setActiveTab] = useState<'posts' | 'media'>('posts');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [creators, setCreators] = useState<any[]>([]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowOptions(false);
    if (showOptions) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showOptions]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, subscriptionsRes] = await Promise.all([
          api.get(`/users/profile/${username}`),
          subscriptionService.getUserSubscriptions(),
        ]);

        const profileData = profileRes.data;
        setProfile(profileData);

        if (profileData.creator) {
          const creatorPosts = await postService.getCreatorPosts(profileData.creator.id);
          setPosts(creatorPosts.posts || []);
        }

        setIsSubscribed(
          subscriptionsRes.some((sub: any) => sub.creatorId === profileData.creator?.id),
        );

        // Fetch other creators for FRIENDS section
        try {
          const creatorsRes = await api.get('/creators');
          // Filter out the current profile creator
          const otherCreators = (creatorsRes.data || []).filter(
            (c: any) => c.id !== profileData.creator?.id
          );
          setCreators(otherCreators.slice(0, 5)); // Limit to 5 friends
        } catch (e) {
          console.error('Failed to fetch creators:', e);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username]);


  const handleSubscribe = async () => {
    if (!profile?.creator?.id) return;
    setIsSubmitting(true);
    try {
      await paymentService.subscribe(profile.creator.id);
      setIsSubscribed(true);
      setShowSubscribeModal(false);
      alert('Successfully subscribed!');
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!profile?.creator?.id) return;
    if (!confirm('Are you sure you want to unsubscribe?')) return;

    setIsSubmitting(true);
    try {
      await subscriptionService.unsubscribe(profile.creator.id);
      setIsSubscribed(false);
      alert('Unsubscribed successfully.');
    } catch (error) {
      console.error('Unsubscription failed:', error);
      alert('Failed to unsubscribe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleStar = () => {
    setIsFavorite(!isFavorite);
  };

  const handleMessage = () => {
    router.push('/messages');
  };

  const handleStatClick = (type: 'photos' | 'videos' | 'stream') => {
    // Navigate to media tab with the appropriate filter
    setActiveTab('media');
    if (type === 'photos') {
      setMediaFilter('photo');
    } else if (type === 'videos') {
      setMediaFilter('video');
    } else {
      setMediaFilter('all');
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setAppliedQuery(searchQuery);
      setIsSearching(false);
    }, 500);
  };

  // Proper media counting - check mediaType or infer from URL
  const isVideo = (post: any) => {
    // Explicit video type
    if (post.mediaType === 'video' || post.mediaType === 'VIDEO') return true;
    // Check file extension in URL (more strict matching)
    if (post.mediaUrl) {
      const url = post.mediaUrl.toLowerCase();
      // Only match actual video file extensions at the end or before query params
      if (/\.(mp4|mov|webm|avi|mkv|m4v)(\?|$)/i.test(url)) return true;
      // Check for video hosting patterns
      if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) return true;
    }
    return false;
  };

  const isPhoto = (post: any) => {
    // If explicitly marked as image
    if (post.mediaType === 'image' || post.mediaType === 'IMAGE') return true;
    // Has media URL and is NOT a video (for backward compatibility)
    if (post.mediaUrl && !isVideo(post)) return true;
    // If no mediaType, treat as photo by default if it's a media post
    if (!post.mediaType && (post.mediaUrl || post.accessLevel)) return true;
    return false;
  };

  // Count ALL posts regardless of lock status - use mediaType if available
  const photoCount = posts.filter(p => isPhoto(p)).length;
  const videoCount = posts.filter(p => isVideo(p)).length;
  const mediaCount = posts.filter(p => p.mediaUrl || p.mediaType).length;

  // Apply both tab filter, media type filter, and search query
  const filteredPosts = posts.filter(p => {
    // Tab filter - show all media posts (even locked ones)
    if (activeTab === 'media' && !p.mediaUrl && !p.mediaType) return false;

    // Media type filter (only applies to media tab)
    if (activeTab === 'media' && mediaFilter !== 'all') {
      if (mediaFilter === 'photo' && !isPhoto(p)) return false;
      if (mediaFilter === 'video' && !isVideo(p)) return false;
    }

    // Search query filter
    if (appliedQuery) {
      const query = appliedQuery.toLowerCase();
      const title = p.title || '';
      const content = p.content || '';
      if (!title.toLowerCase().includes(query) && !content.toLowerCase().includes(query)) {
        return false;
      }
    }

    return true;
  });

  // Wait for auth to complete first
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #f3f3f3', borderTop: '3px solid #00aff0', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', padding: '0 24px', gap: '24px' }}>
          <Navbar />
          <main style={{ flex: 1, padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#8a96a3' }}>Loading...</p>
          </main>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', padding: '0 24px', gap: '24px' }}>
          <Navbar />
          <main style={{ flex: 1, padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#8a96a3' }}>Profile not found</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', padding: '0 24px', gap: '24px' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', padding: '0' }}>
          <div style={{
            flex: 1,
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: '24px'
          }}>
            {/* Main Content Column */}
            <div style={{
              minWidth: 0,
              background: 'white',
              border: '1px solid #dbdbdb',
              borderRadius: '0 0 4px 4px'
            }}>
              {/* Cover Image with Profile Info Overlay */}
              <div style={{ position: 'relative' }}>
                {/* Cover Image */}
                <div style={{
                  width: '100%',
                  height: '240px',
                  background: !profile.creator?.coverImageUrl ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined,
                  position: 'relative'
                }}>
                  {profile.creator?.coverImageUrl && (
                    <img
                      src={getEmbedUrl(profile.creator.coverImageUrl)}
                      alt="Cover"
                      referrerPolicy="no-referrer"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}

                  {/* Header Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: '12px 16px',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 10
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      {/* Back Button */}
                      <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="19" y1="12" x2="5" y2="12"></line>
                          <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                      </button>

                      {/* User Info & Stats */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h2 style={{ fontSize: '19px', fontWeight: 700, margin: 0, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                            {profile.creator?.displayName || username}
                          </h2>
                          {profile.creator?.verified && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          )}
                        </div>

                        {/* Stats Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontSize: '13px', fontWeight: 500, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                          <div
                            onClick={() => handleStatClick('photos')}
                            title={isSubscribed ? "View photos" : "Subscribe to view photos"}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', opacity: 1, transition: 'opacity 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            <span>{photoCount}</span>
                          </div>
                          <span>•</span>
                          <div
                            onClick={() => handleStatClick('videos')}
                            title={isSubscribed ? "View videos" : "Subscribe to view videos"}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', opacity: 1, transition: 'opacity 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                            <span>{videoCount}</span>
                          </div>
                          <span>•</span>
                          <div
                            onClick={() => handleStatClick('stream')}
                            title={isSubscribed ? "View streams" : "Subscribe to view streams"}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', opacity: 1, transition: 'opacity 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>0</span>
                          </div>
                          <span>•</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Total likes">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            <span>85.3K</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Options Button */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                      </button>

                      {showOptions && (
                        <div onClick={(e) => e.stopPropagation()} style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          background: 'white',
                          border: '1px solid #dbdbdb',
                          borderRadius: '4px',
                          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                          zIndex: 100,
                          minWidth: '240px',
                          marginTop: '10px',
                          padding: '8px 0'
                        }}>
                          <button onClick={() => { handleCopyLink(); setShowOptions(false); }} style={{ display: 'block', width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#242529', fontWeight: 500 }}>
                            Copy link to profile
                          </button>
                          <button onClick={() => { alert('Add/Remove lists mock'); setShowOptions(false); }} style={{ display: 'block', width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#242529', fontWeight: 500 }}>
                            Add to / remove from lists
                          </button>
                          <div style={{ height: '1px', background: '#eaeaea', margin: '8px 0' }}></div>
                          <button onClick={() => { alert('Restricted user'); setShowOptions(false); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#242529', fontWeight: 500 }}>
                            <span>Restrict</span>
                            <span style={{ fontSize: '12px', color: '#8a96a3' }}>ⓘ</span>
                          </button>
                          <button onClick={() => { alert('Blocked user'); setShowOptions(false); }} style={{ display: 'block', width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#242529', fontWeight: 500 }}>
                            Block
                          </button>
                          <button onClick={() => { alert('Reported user'); setShowOptions(false); }} style={{ display: 'block', width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#242529', fontWeight: 500 }}>
                            Report
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Info Section */}
                <div style={{ padding: '0 16px 20px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-45px' }}>
                    <div style={{ position: 'relative' }}>
                      {profile.avatarUrl ? (
                        <img
                          src={getEmbedUrl(profile.avatarUrl)}
                          alt={username}
                          referrerPolicy="no-referrer"
                          style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white' }}
                        />
                      ) : (
                        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#00aeef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '36px', fontWeight: 'bold', border: '3px solid white' }}>
                          {username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      {/* Online Indicator */}
                      <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '14px', height: '14px', background: '#4CAF50', borderRadius: '50%', border: '2px solid white' }} />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', paddingBottom: '10px' }}>
                      <button
                        onClick={handleStar}
                        style={{
                          width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e5e7eb',
                          background: 'white', color: isFavorite ? '#ffd700' : '#8a96a3', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                        }}
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        {isFavorite ? '★' : '☆'}
                      </button>
                      <button
                        onClick={handleCopyLink}
                        style={{
                          width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e5e7eb',
                          background: 'white', color: '#8a96a3', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Copy Link"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                      </button>
                    </div>
                  </div>

                  {/* User Details */}
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <h1 style={{ fontSize: '19px', fontWeight: 700, margin: 0, color: '#242529' }}>
                        {profile.creator?.displayName || username}
                      </h1>
                      {profile.creator?.verified && (
                        <span style={{ color: '#00aff0', fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8a96a3', fontSize: '14px' }}>
                      <span>@{username}</span>
                      <span>•</span>
                      <span style={{ color: '#4CAF50' }}>Available now</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.creator?.bio && (
                    <div style={{ marginTop: '12px' }}>
                      <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#242529', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {profile.creator.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs Section */}
              <div style={{ display: 'flex', borderBottom: '1px solid #eaeaea', background: 'white' }}>
                <button
                  onClick={() => setActiveTab('posts')}
                  style={{
                    flex: 1, fontSize: '14px', fontWeight: activeTab === 'posts' ? 700 : 500,
                    color: activeTab === 'posts' ? '#242529' : '#8a96a3',
                    background: 'none', border: 'none', padding: '16px 0', cursor: 'pointer',
                    borderBottom: activeTab === 'posts' ? '2px solid #00aff0' : '2px solid transparent',
                    textTransform: 'uppercase'
                  }}>
                  {posts.length} POSTS
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  style={{
                    flex: 1, fontSize: '14px', fontWeight: activeTab === 'media' ? 700 : 500,
                    color: activeTab === 'media' ? '#242529' : '#8a96a3',
                    background: 'none', border: 'none', padding: '16px 0', cursor: 'pointer',
                    borderBottom: activeTab === 'media' ? '2px solid #00aff0' : '2px solid transparent',
                    textTransform: 'uppercase'
                  }}>
                  {mediaCount} MEDIA
                </button>
              </div>

              {/* Media Filter Pills (only show on media tab) */}
              {activeTab === 'media' && (
                <div style={{ padding: '16px', background: 'white', borderBottom: '1px solid #eaeaea' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#8a96a3', textTransform: 'uppercase' }}>RECENT</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" style={{ cursor: 'pointer' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" style={{ cursor: 'pointer' }}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" style={{ cursor: 'pointer' }}><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setMediaFilter('all')}
                      style={{
                        padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                        border: mediaFilter === 'all' ? 'none' : '1px solid #dbdbdb',
                        background: mediaFilter === 'all' ? '#1a1a2e' : 'white',
                        color: mediaFilter === 'all' ? 'white' : '#242529',
                        cursor: 'pointer'
                      }}
                    >
                      All {mediaCount}
                    </button>
                    <button
                      onClick={() => setMediaFilter('photo')}
                      style={{
                        padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                        border: mediaFilter === 'photo' ? 'none' : '1px solid #dbdbdb',
                        background: mediaFilter === 'photo' ? '#1a1a2e' : 'white',
                        color: mediaFilter === 'photo' ? 'white' : '#242529',
                        cursor: 'pointer'
                      }}
                    >
                      Photo {photoCount}
                    </button>
                    <button
                      onClick={() => setMediaFilter('video')}
                      style={{
                        padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                        border: mediaFilter === 'video' ? 'none' : '1px solid #dbdbdb',
                        background: mediaFilter === 'video' ? '#1a1a2e' : 'white',
                        color: mediaFilter === 'video' ? 'white' : '#242529',
                        cursor: 'pointer'
                      }}
                    >
                      Video {videoCount}
                    </button>
                  </div>
                </div>
              )}

              {/* Posts Content */}
              <div style={{ padding: '0' }}>
                {isSearching ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#8a96a3' }}>
                    <div style={{ width: '24px', height: '24px', border: '3px solid #f3f3f3', borderTop: '3px solid #00aff0', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
                    <span>Searching...</span>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#8a96a3' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
                    <div style={{ fontWeight: 600 }}>No {activeTab} available</div>
                  </div>
                ) : activeTab === 'media' ? (
                  // Media Grid View with locking
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', padding: '4px' }}>
                    {filteredPosts.map((post) => {
                      // Use the isLocked flag from API response
                      const isPPV = post.accessLevel === 'PPV';
                      const isLocked = post.isLocked;
                      const isVideoPost = isVideo(post);

                      return (
                        <div
                          key={post.id}
                          style={{
                            aspectRatio: '1',
                            position: 'relative',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            background: '#f0f0f0'
                          }}
                          onClick={() => {
                            if (isLocked) {
                              if (isPPV) {
                                alert(`This content requires a payment of $${post.price || 0}`);
                              } else {
                                setShowSubscribeModal(true);
                              }
                            }
                          }}
                        >
                          {/* Media Thumbnail or Locked Placeholder */}
                          {post.mediaUrl ? (
                            <img
                              src={getEmbedUrl(post.mediaUrl)}
                              alt="Media"
                              referrerPolicy="no-referrer"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: isLocked ? 'blur(20px)' : 'none'
                              }}
                            />
                          ) : (
                            // Placeholder for locked posts without media preview
                            <div style={{
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}>
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                              </svg>
                              <span style={{ fontSize: '10px', marginTop: '6px', textAlign: 'center', padding: '0 4px' }}>
                                Subscribe to unlock
                              </span>
                            </div>
                          )}

                          {/* Lock Overlay */}
                          {isLocked && (
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'rgba(0,0,0,0.5)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                              </svg>
                              {isPPV && (
                                <span style={{ fontSize: '12px', marginTop: '4px', fontWeight: 600 }}>
                                  ${post.price || 0}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Video Indicator */}
                          {isVideoPost && !isLocked && (
                            <div style={{
                              position: 'absolute',
                              bottom: '8px',
                              left: '8px',
                              background: 'rgba(0,0,0,0.6)',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                              </svg>
                            </div>
                          )}

                          {/* Multi-image indicator */}
                          {post.mediaCount > 1 && (
                            <div style={{
                              position: 'absolute',
                              bottom: '8px',
                              right: '8px',
                              background: 'rgba(0,0,0,0.6)',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: 'white',
                              fontSize: '11px'
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="white" strokeWidth="2"></rect>
                              </svg>
                              {post.mediaCount}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Posts list view
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {filteredPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            {profile.creator && (
              <div style={{ position: 'sticky', top: '80px', height: 'fit-content', minWidth: '360px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Search */}
                <div style={{ background: 'white', border: '1px solid #dbdbdb', borderRadius: '4px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Search user's posts"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#242529' }}
                  />
                  <div onClick={handleSearch} style={{ cursor: 'pointer', display: 'flex' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                </div>

                {/* Recent Media (for subscribers) */}
                {isSubscribed && (
                  <div style={{ background: 'white', border: '1px solid #dbdbdb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#8a96a3', textTransform: 'uppercase' }}>RECENT</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {posts.filter(p => p.mediaUrl).slice(0, 3).map((post, idx) => (
                          <div key={idx} style={{ aspectRatio: '1/1', background: '#f0f0f0', position: 'relative' }}>
                            {post.mediaUrl && (
                              <img src={getEmbedUrl(post.mediaUrl)} alt="Recent" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                          </div>
                        ))}
                        {posts.filter(p => p.mediaUrl).length === 0 && [1, 2, 3].map(i => (
                          <div key={i} style={{ aspectRatio: '1/1', background: '#f5f5f5' }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* FRIENDS Section */}
                {isSubscribed && creators.length > 0 && (
                  <div style={{ background: 'white', border: '1px solid #dbdbdb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#8a96a3', textTransform: 'uppercase' }}>FRIENDS</h3>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" style={{ cursor: 'pointer' }}>
                          <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {/* Real Creators from DB */}
                        {creators.map((creator, idx) => (
                          <div
                            key={creator.id || idx}
                            onClick={() => router.push(`/profile/${creator.user?.username || creator.username}`)}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '70px', cursor: 'pointer' }}
                          >
                            <div style={{ position: 'relative' }}>
                              {creator.user?.avatarUrl || creator.avatarUrl ? (
                                <img
                                  src={getEmbedUrl(creator.user?.avatarUrl || creator.avatarUrl)}
                                  alt={creator.displayName || creator.user?.username}
                                  referrerPolicy="no-referrer"
                                  style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    objectFit: 'cover', border: '2px solid #00aeef'
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: '60px', height: '60px', borderRadius: '50%',
                                  background: `linear-gradient(135deg, hsl(${idx * 60}, 70%, 60%) 0%, hsl(${idx * 60 + 30}, 70%, 50%) 100%)`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'white', fontWeight: 'bold', fontSize: '20px'
                                }}>
                                  {(creator.displayName || creator.user?.username || 'U')[0].toUpperCase()}
                                </div>
                              )}
                              <span style={{
                                position: 'absolute', top: 0, right: 0,
                                background: creator.subscriptionFee > 0 ? '#ff6b6b' : '#00aeef',
                                color: 'white', fontSize: '9px', fontWeight: 700,
                                padding: '2px 4px', borderRadius: '4px', textTransform: 'uppercase'
                              }}>
                                {creator.subscriptionFee > 0 ? `$${creator.subscriptionFee}` : 'Free'}
                              </span>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: '#242529', display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'center', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {(creator.displayName || creator.user?.username || 'Creator').slice(0, 10)}
                                {creator.verified && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#00aff0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                )}
                              </div>
                              <div style={{ fontSize: '10px', color: '#8a96a3' }}>@{creator.user?.username || creator.username || 'user'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Subscription Card */}
                <div style={{ background: 'white', border: '1px solid #dbdbdb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#8a96a3', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px', marginTop: 0 }}>
                      SUBSCRIPTION
                    </h3>

                    {isSubscribed ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #dbdbdb', borderRadius: '1000px', padding: '10px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#00aff0', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase' }}>SUBSCRIBED</span>
                            <span style={{ color: '#00aff0' }}>✓</span>
                          </div>
                          <span style={{ color: '#00aff0', fontWeight: 700, fontSize: '13px' }}>
                            {profile.creator.subscriptionFee > 0 ? `$${profile.creator.subscriptionFee}/mo` : 'FREE'}
                          </span>
                        </div>
                        <button
                          onClick={handleMessage}
                          style={{
                            width: '100%', padding: '14px', borderRadius: '1000px', border: 'none',
                            background: '#00aff0', color: 'white', fontSize: '14px', fontWeight: 700,
                            cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', textTransform: 'uppercase'
                          }}
                        >
                          ✉️ MESSAGE
                        </button>
                        <button
                          onClick={handleUnsubscribe}
                          disabled={isSubmitting}
                          style={{
                            width: '100%', padding: '14px', borderRadius: '1000px', border: '1px solid #dbdbdb',
                            background: 'white', color: '#242529', fontSize: '14px', fontWeight: 700,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer', textTransform: 'uppercase', opacity: isSubmitting ? 0.7 : 1
                          }}
                        >
                          {isSubmitting ? 'Processing...' : 'Unsubscribe'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleSubscribe}
                        disabled={isSubmitting}
                        style={{
                          width: '100%', padding: '14px', borderRadius: '1000px', border: 'none',
                          background: '#00aff0', color: 'white', fontSize: '14px', fontWeight: 700,
                          cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', paddingLeft: '24px', paddingRight: '24px', opacity: isSubmitting ? 0.7 : 1, textTransform: 'uppercase'
                        }}
                      >
                        {isSubmitting ? (
                          <div style={{ width: '100%', textAlign: 'center' }}>Processing...</div>
                        ) : (
                          <>
                            <span>SUBSCRIBE</span>
                            <span>{profile.creator.subscriptionFee > 0 ? `$${profile.creator.subscriptionFee}` : 'FOR FREE'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #eaeaea', padding: '15px 20px' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#8a96a3' }}>
                      {isSubscribed
                        ? 'You are currently subscribed'
                        : `Regular price $${profile.creator.subscriptionFee?.toFixed(2) || '0.00'} /month`
                      }
                    </p>
                  </div>
                </div>

                {/* Footer Links */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start', fontSize: '12px', color: '#8a96a3', paddingLeft: '4px' }}>
                  <a href="#" style={{ color: '#8a96a3', textDecoration: 'none' }}>Privacy</a>
                  <span>·</span>
                  <a href="#" style={{ color: '#8a96a3', textDecoration: 'none' }}>Cookie Notice</a>
                  <span>·</span>
                  <a href="#" style={{ color: '#8a96a3', textDecoration: 'none' }}>Terms of Service</a>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }} onClick={() => setShowSubscribeModal(false)}>
          <div style={{
            background: 'white', borderRadius: '16px', width: '90%', maxWidth: '400px',
            overflow: 'hidden', position: 'relative'
          }} onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{ height: '80px', background: profile?.creator?.coverImageUrl ? `url(${getEmbedUrl(profile.creator.coverImageUrl)}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative' }}>
              <button
                onClick={() => setShowSubscribeModal(false)}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: 'white', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>

            {/* Avatar Overlay */}
            <div style={{ marginTop: '-40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {profile?.avatarUrl ? (
                <img src={getEmbedUrl(profile.avatarUrl)} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid white', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#00aeef', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 'bold' }}>
                  {username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  {profile?.creator?.displayName || username}
                  {profile?.creator?.verified && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#00aff0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                  )}
                </h3>
                <p style={{ margin: '4px 0 0', color: '#8a96a3', fontSize: '14px' }}>@{username}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '0 24px 24px' }}>
              <h4 style={{ color: '#8a96a3', fontSize: '12px', fontWeight: 700, textAlign: 'center', margin: '16px 0 24px', letterSpacing: '0.5px' }}>
                SUBSCRIBE AND GET THESE BENEFITS:
              </h4>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px', color: '#242529' }}>
                  <span style={{ color: '#00aff0', fontSize: '20px' }}>✓</span> Full access to this user's content
                </li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px', color: '#242529' }}>
                  <span style={{ color: '#00aff0', fontSize: '20px' }}>✓</span> Direct message with this user
                </li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px', color: '#242529' }}>
                  <span style={{ color: '#00aff0', fontSize: '20px' }}>✓</span> Cancel your subscription at any time
                </li>
              </ul>

              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={handleSubscribe}
                  disabled={isSubmitting}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '1000px', border: 'none',
                    background: '#00aff0', color: 'white', fontSize: '14px', fontWeight: 700,
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingLeft: '24px', paddingRight: '24px', textTransform: 'uppercase'
                  }}
                >
                  <span>SUBSCRIBE</span>
                  <span>{profile.creator.subscriptionFee > 0 ? `$${profile.creator.subscriptionFee}` : 'FOR FREE'}</span>
                </button>
              </div>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button style={{ background: 'none', border: 'none', color: '#00aff0', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowSubscribeModal(false)}>
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
