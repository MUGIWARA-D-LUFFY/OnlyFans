'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';
import api from '../services/api';
import { Post } from '../services/post.service';
import * as postInteractions from '../services/post-interactions.service';
import type { Comment } from '../services/post-interactions.service';

interface PostCardProps {
  post: Post;
}

// Icons for post actions
const Icons = {
  moreHorizontal: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
      <circle cx="5" cy="12" r="1"></circle>
    </svg>
  ),
  verified: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#00aeef" stroke="white" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="9 12 11 14 15 10" stroke="white" fill="none"></polyline>
    </svg>
  ),
  like: (filled: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : '#8a96a3'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  ),
  comment: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  tip: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  ),
  bookmark: (filled: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#00aeef' : 'none'} stroke={filled ? '#00aeef' : '#8a96a3'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  copy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  ),
  flag: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
      <line x1="4" y1="22" x2="4" y2="15"></line>
    </svg>
  ),
  eyeOff: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  ),
  image: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  )
};

// Helper to format relative time
const formatRelativeTime = (date: string) => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return postDate.toLocaleDateString();
};

// Helper to parse and highlight mentions and links
const parseContent = (content: string) => {
  if (!content) return null;

  // Split by mentions and links
  const parts = content.split(/(@\w+|https?:\/\/[^\s]+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return (
        <Link
          key={index}
          href={`/profile/${part.slice(1)}`}
          style={{ color: '#00aeef', textDecoration: 'none' }}
        >
          {part}
        </Link>
      );
    }
    if (part.startsWith('http')) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#00aeef', textDecoration: 'none' }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

// Helper to convert Google Drive view links to direct embed links (for images)
const getEmbedUrl = (url: string) => {
  if (!url) return '';

  // Handle Google Drive links
  if (url.includes('drive.google.com')) {
    // Extract ID from /file/d/ID/view or id=ID
    const idMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      // Use thumbnail endpoint which is more reliable for images (bypasses virus scan warnings and some 403s)
      // sz=s2000 requests a large version (up to 2000px)
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=s2000`;
    }
  }

  return url;
};

// Helper to get Google Drive video preview URL
const getVideoPreviewUrl = (url: string) => {
  if (!url) return '';

  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
  }

  return url;
};

// Check if URL is a Google Drive link
const isGoogleDriveUrl = (url: string) => {
  return url && url.includes('drive.google.com');
};

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState('5');
  const [isTipping, setIsTipping] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false); // Added
  const [isUnlockLoading, setIsUnlockLoading] = useState(false); // Added

  const { user } = useAuthStore(); // Use store directly, not guard
  const router = useRouter();

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // More menu dropdown state
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Fetch initial like and bookmark status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [likeStatus, bookmarkStatus] = await Promise.all([
          postInteractions.getLikeStatus(post.id).catch(() => ({ isLiked: false, count: 0 })),
          postInteractions.getBookmarkStatus(post.id).catch(() => ({ isBookmarked: false }))
        ]);
        setIsLiked(likeStatus.isLiked);
        setLikeCount(likeStatus.count);
        setIsBookmarked(bookmarkStatus.isBookmarked);
      } catch (error) {
        console.error('Failed to fetch post status:', error);
      }
    };
    fetchStatus();
  }, [post.id]);

  // Fetch comment count
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const response = await postInteractions.getComments(post.id, 1, 1);
        setCommentCount(response.total);
      } catch (error) {
        console.error('Failed to fetch comment count:', error);
      }
    };
    fetchCommentCount();
  }, [post.id]);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUnlock = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!confirm(`Unlock this post for $${post.price}?`)) return;

    setIsUnlockLoading(true);
    try {
      await api.post(`/payments/ppv/${post.id}`);
      alert('Payment successful! Post unlocked.');
      window.location.reload(); // Refresh to update visibility
    } catch (error: any) {
      console.error('Failed to unlock post:', error);
      alert(error.response?.data?.message || 'Failed to unlock post');
    } finally {
      setIsUnlockLoading(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      if (isLiked) {
        await postInteractions.unlikePost(post.id);
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await postInteractions.likePost(post.id);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (isBookmarking) return;
    setIsBookmarking(true);
    try {
      if (isBookmarked) {
        await postInteractions.removeBookmark(post.id);
        setIsBookmarked(false);
      } else {
        await postInteractions.addBookmark(post.id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleTip = async () => {
    if (isTipping) return;
    setIsTipping(true);
    try {
      await postInteractions.sendTip(post.creator.id, parseFloat(tipAmount));
      setShowTipModal(false);
      setTipAmount('5');
      alert('Tip sent successfully!');
    } catch (error) {
      console.error('Failed to send tip:', error);
      alert('Failed to send tip. Please try again.');
    } finally {
      setIsTipping(false);
    }
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      await loadComments();
    }
    setShowComments(!showComments);
  };

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await postInteractions.getComments(post.id, 1, 50);
      setComments(response.comments);
      setCommentCount(response.total);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const comment = await postInteractions.createComment(post.id, newComment.trim());
      setComments((prev) => [comment, ...prev]);
      setCommentCount((prev) => prev + 1);
      setNewComment('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await postInteractions.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    setShowMoreMenu(false);
    alert('Link copied to clipboard!');
  };

  const handleReport = () => {
    setShowMoreMenu(false);
    alert('Thank you for your report. We will review this content.');
  };

  const handleHide = () => {
    setShowMoreMenu(false);
    alert('This post has been hidden from your feed.');
  };

  return (
    <>
      <div style={{
        background: 'white',
        marginBottom: '16px',
        borderRadius: '0',
        borderTop: '1px solid #eaeaea',
        padding: '16px'
      }}>
        {/* Post Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <Link
            href={`/profile/${post.creator.user.username}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none'
            }}
          >
            {/* Avatar */}
            {post.creator.user.avatarUrl ? (
              <img
                src={getEmbedUrl(post.creator.user.avatarUrl)}
                alt={post.creator.user.username}
                referrerPolicy="no-referrer"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #00aeef'
                }}
              />
            ) : (
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00aeef 0%, #00c6ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {post.creator.user.username?.[0]?.toUpperCase() || 'C'}
              </div>
            )}

            {/* Username and Time */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#1a1a2e'
                }}>
                  {post.creator.user.username}
                </span>
                {Icons.verified()}
              </div>
              <div style={{
                fontSize: '13px',
                color: '#8a96a3'
              }}>
                @{post.creator.user.username}
              </div>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#8a96a3' }}>
              {formatRelativeTime(post.createdAt)}
            </span>
            {/* More Menu Dropdown */}
            <div ref={moreMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {Icons.moreHorizontal()}
              </button>
              {showMoreMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  minWidth: '180px',
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={handleCopyLink}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#1a1a2e',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {Icons.copy()} Copy link
                  </button>
                  <button
                    onClick={handleHide}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#1a1a2e',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {Icons.eyeOff()} Hide post
                  </button>
                  <button
                    onClick={handleReport}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#ef4444',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {Icons.flag()} Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Post Content */}
        {post.title && (
          <div style={{
            marginBottom: '16px',
            fontSize: '15px',
            lineHeight: '1.5',
            color: '#1a1a2e'
          }}>
            {parseContent(post.title)}
          </div>
        )}

        {/* Media */}
        <div style={{
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '16px',
          background: !post.mediaUrl ? '#f8f9fa' : 'transparent',
          minHeight: !post.mediaUrl ? '300px' : 'auto',
          display: !post.mediaUrl ? 'flex' : 'block',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {!post.mediaUrl ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', width: '100%' }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '16px',
                color: '#e0e0e0',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#8a96a3',
                marginBottom: '24px',
                fontSize: '14px'
              }}>
                {Icons.image()} 1
              </div>

              <button
                onClick={handleUnlock}
                disabled={isUnlockLoading}
                style={{
                  background: isUnlockLoading ? '#9ca3af' : '#00aeef',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: isUnlockLoading ? 'wait' : 'pointer',
                  width: '100%',
                  maxWidth: '300px',
                  textTransform: 'uppercase'
                }}>
                {isUnlockLoading ? 'PROCESSING...' : post.isPaid ? `UNLOCK POST $${post.price?.toFixed(2) || '0.00'}` : "SUBSCRIBE TO SEE USER'S POSTS"}
              </button>
            </div>
          ) : post.mediaType === 'image' ? (
            <img
              src={getEmbedUrl(post.mediaUrl)}
              alt={post.title || 'Post'}
              referrerPolicy="no-referrer"
              style={{
                width: '100%',
                display: 'block',
                maxHeight: '500px',
                objectFit: 'cover'
              }}
            />
          ) : isGoogleDriveUrl(post.mediaUrl) ? (
            <iframe
              src={getVideoPreviewUrl(post.mediaUrl)}
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{
                width: '100%',
                height: '400px',
                border: 'none',
                display: 'block'
              }}
            />
          ) : (
            <video
              src={post.mediaUrl}
              controls
              style={{
                width: '100%',
                display: 'block',
                maxHeight: '500px'
              }}
            />
          )}
        </div>

        {/* Paid Badge */}
        {post.isPaid && (
          <div style={{ marginBottom: '12px' }}>
            <span style={{
              padding: '6px 14px',
              background: 'linear-gradient(135deg, #00aeef 0%, #00c6ff 100%)',
              color: 'white',
              fontSize: '13px',
              borderRadius: '20px',
              fontWeight: 600
            }}>
              💎 ${post.price}
            </span>
          </div>
        )}

        {/* Post Actions */}
        <div style={{
          display: 'flex',
          gap: '24px',
          paddingTop: '8px'
        }}>
          <button
            onClick={handleLike}
            disabled={isLiking}
            style={{
              background: 'none',
              border: 'none',
              cursor: isLiking ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: isLiked ? '#ef4444' : '#8a96a3',
              fontSize: '14px',
              transition: 'transform 0.2s'
            }}
          >
            {Icons.like(isLiked)}
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <button
            onClick={toggleComments}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: showComments ? '#00aeef' : '#8a96a3',
              fontSize: '14px'
            }}
          >
            {Icons.comment()}
            {commentCount > 0 && <span>{commentCount}</span>}
          </button>
          <button
            onClick={() => setShowTipModal(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#8a96a3',
              fontSize: '14px'
            }}
          >
            {Icons.tip()}
          </button>
          <button
            onClick={handleBookmark}
            disabled={isBookmarking}
            style={{
              background: 'none',
              border: 'none',
              cursor: isBookmarking ? 'wait' : 'pointer',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.2s'
            }}
          >
            {Icons.bookmark(isBookmarked)}
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #eaeaea'
          }}>
            {/* Comment Input */}
            <form onSubmit={handleSubmitComment} style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: '1px solid #eaeaea',
                  borderRadius: '25px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                style={{
                  padding: '10px 16px',
                  borderRadius: '25px',
                  border: 'none',
                  background: newComment.trim() ? '#00aeef' : '#e0e0e0',
                  color: 'white',
                  cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                {Icons.send()}
              </button>
            </form>

            {/* Comments List */}
            {isLoadingComments ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8a96a3' }}>
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8a96a3', fontSize: '14px' }}>
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {comments.map((comment) => (
                  <div key={comment.id} style={{
                    display: 'flex',
                    gap: '10px',
                    padding: '12px',
                    background: '#f9f9f9',
                    borderRadius: '12px'
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#00aeef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {comment.user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '13px', color: '#1a1a2e' }}>
                            {comment.user?.username || 'Anonymous'}
                          </span>
                          <span style={{ color: '#8a96a3', fontSize: '12px', marginLeft: '8px' }}>
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#8a96a3',
                            padding: '4px'
                          }}
                          title="Delete comment"
                        >
                          {Icons.trash()}
                        </button>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#1a1a2e', lineHeight: '1.4' }}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <>
          <div
            onClick={() => setShowTipModal(false)}
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
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '320px',
            zIndex: 1001,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600 }}>
              Send a Tip to {post.creator.user.username}
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                Amount ($)
              </label>
              <input
                type="number"
                min="1"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['5', '10', '20', '50'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTipAmount(amount)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: tipAmount === amount ? '2px solid #00aeef' : '1px solid #ddd',
                    borderRadius: '8px',
                    background: tipAmount === amount ? '#f0f9ff' : 'white',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowTipModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '25px',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleTip}
                disabled={isTipping || !tipAmount || parseFloat(tipAmount) <= 0}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '25px',
                  background: '#00aeef',
                  color: 'white',
                  cursor: isTipping ? 'wait' : 'pointer',
                  fontWeight: 600,
                  opacity: isTipping ? 0.7 : 1
                }}
              >
                {isTipping ? 'Sending...' : `Send $${tipAmount}`}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
