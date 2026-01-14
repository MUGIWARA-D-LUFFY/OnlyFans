'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuthGuard } from '../../utils/authGuard';
import api from '../../services/api';
import * as notificationService from '../../services/notification.service';
import type { Notification } from '../../services/notification.service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  pencil: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
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
  verified: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#00aeef" stroke="white" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="9 12 11 14 15 10" stroke="white" fill="none"></polyline>
    </svg>
  )
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthGuard(true);
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'like', label: 'Likes' },
    { id: 'comment', label: 'Comments' },
    { id: 'mention', label: 'Mentions' },
    { id: 'subscription', label: 'Subscriptions' },
    { id: 'promotion', label: 'Promotions' }
  ];

  // Fetch notifications when tab changes
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user) {
      loadCreators();
    }
  }, [user]);

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const type = activeTab === 'all' ? undefined : activeTab;
      const data = await notificationService.getNotifications(type);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

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

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa' }}>
        <Navbar />
        <main style={{ marginLeft: '260px', padding: '24px' }}>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: '#8a96a3', fontSize: '16px' }}>Loading...</p>
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
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 0',
            borderBottom: '1px solid #eaeaea'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => router.back()}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#1a1a2e'
                }}
              >
                {Icons.back()}
              </button>
              <h1 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#1a1a2e',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                NOTIFICATIONS
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
                  alignItems: 'center'
                }}
              >
                {Icons.search()}
              </button>
              <button
                onClick={() => router.push('/settings')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {Icons.settings()}
              </button>
            </div>
          </div>

          {/* Search Input */}
          {showSearchInput && (
            <div style={{
              padding: '12px 0',
              borderBottom: '1px solid #eaeaea'
            }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
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

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '16px 0',
            borderBottom: '1px solid #eaeaea',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: activeTab === tab.id ? 'none' : '1px solid #ddd',
                  background: activeTab === tab.id ? '#00aeef' : 'white',
                  color: activeTab === tab.id ? 'white' : '#1a1a2e',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              marginLeft: 'auto'
            }}>
              {Icons.pencil()}
            </button>
          </div>

          {/* Notifications Content */}
          <div style={{ paddingTop: '16px' }}>
            {loadingNotifications ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ color: '#8a96a3', fontSize: '15px' }}>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ paddingTop: '60px', textAlign: 'center' }}>
                <p style={{ color: '#8a96a3', fontSize: '15px', margin: 0 }}>
                  No notifications currently!
                </p>
              </div>
            ) : (
              <div>
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#00aeef',
                      fontSize: '13px',
                      cursor: 'pointer',
                      marginBottom: '12px',
                      padding: 0
                    }}
                  >
                    Mark all as read
                  </button>
                )}
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #eaeaea',
                      background: notification.isRead ? 'transparent' : '#f0f8ff',
                      cursor: notification.isRead ? 'default' : 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      {/* Icon based on type */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: notification.type === 'LIKE' ? '#fee2e2'
                          : notification.type === 'SUBSCRIPTION' ? '#dcfce7'
                            : notification.type === 'TIP' ? '#fef3c7'
                              : '#e0f2fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        {notification.type === 'LIKE' && '❤️'}
                        {notification.type === 'COMMENT' && '💬'}
                        {notification.type === 'MENTION' && '@'}
                        {notification.type === 'SUBSCRIPTION' && '🎉'}
                        {notification.type === 'TIP' && '💵'}
                        {notification.type === 'PROMOTION' && '📢'}
                        {notification.type === 'SYSTEM' && '🔔'}
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: notification.isRead ? 400 : 600,
                          color: '#1a1a2e',
                          marginBottom: '4px'
                        }}>
                          {notification.title}
                        </div>
                        <div style={{ fontSize: '13px', color: '#8a96a3' }}>
                          {notification.message}
                        </div>
                        <div style={{ fontSize: '12px', color: '#8a96a3', marginTop: '4px' }}>
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {/* Unread indicator */}
                      {!notification.isRead && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#00aeef'
                        }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                <button style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
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
    </div>
  );
}
