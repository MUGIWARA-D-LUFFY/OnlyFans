'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuthGuard } from '../../utils/authGuard';
import { subscriptionService, Subscription } from '../../services/subscription.service';
import Link from 'next/link';

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
  sliders: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  verified: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#00aeef" stroke="white" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="9 12 11 14 15 10" stroke="white" fill="none"></polyline>
    </svg>
  ),
  emptySearch: () => (
    <svg width="100" height="100" viewBox="0 0 120 120" fill="none">
      <rect x="20" y="30" width="80" height="60" rx="8" fill="#f0f0f0" />
      <circle cx="85" cy="65" r="20" fill="#e8e8e8" />
      <circle cx="85" cy="65" r="12" fill="#f5f5f5" />
      <line x1="95" y1="75" x2="105" y2="85" stroke="#d0d0d0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="50" r="4" fill="#d0d0d0" />
      <circle cx="60" cy="60" r="4" fill="#d0d0d0" />
      <circle cx="60" cy="70" r="4" fill="#d0d0d0" />
    </svg>
  )
};

// List category types
type ListCategory = 'all' | 'fans' | 'following' | 'restricted' | 'blocked';

interface ListItem {
  id: ListCategory;
  name: string;
}

type FilterType = 'all' | 'active' | 'expired' | 'attention';

export default function SubscriptionsPage() {
  const { user, isLoading: authLoading } = useAuthGuard(true);
  const [activeMainTab, setActiveMainTab] = useState<'userLists' | 'bookmarks'>('userLists');
  const [activeDetailTab, setActiveDetailTab] = useState<'users' | 'posts'>('users');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedList, setSelectedList] = useState<ListCategory>('following');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Standard list categories
  const listCategories: ListItem[] = [
    { id: 'all', name: 'All Creators' },
    { id: 'fans', name: 'Fans' },
    { id: 'following', name: 'Following' },
    { id: 'restricted', name: 'Restricted' },
    { id: 'blocked', name: 'Blocked' }
  ];

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subs = await subscriptionService.getUserSubscriptions();
        setSubscriptions(subs);
      } catch (error) {
        console.error('Failed to load subscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  // Calculate counts from actual data
  const getCounts = () => {
    const now = new Date();
    const activeSubs = subscriptions.filter((s) => new Date(s.expiresAt) > now);
    const expiredSubs = subscriptions.filter((s) => new Date(s.expiresAt) <= now);

    return {
      all: subscriptions.length,
      active: activeSubs.length,
      expired: expiredSubs.length,
      attention: 0
    };
  };

  const counts = getCounts();

  const getFilteredSubscriptions = () => {
    const now = new Date();

    switch (activeFilter) {
      case 'active':
        return subscriptions.filter((s) => new Date(s.expiresAt) > now);
      case 'expired':
        return subscriptions.filter((s) => new Date(s.expiresAt) <= now);
      case 'attention':
        return []; // Would filter based on attention-required logic
      default:
        return subscriptions;
    }
  };

  const getListCount = (listId: ListCategory) => {
    if (listId === 'following') return subscriptions.length;
    return 0;
  };

  const filters = [
    { id: 'all' as FilterType, label: 'All', count: counts.all },
    { id: 'active' as FilterType, label: 'Active', count: counts.active },
    { id: 'expired' as FilterType, label: 'Expired', count: counts.expired, highlight: true },
    { id: 'attention' as FilterType, label: 'Attention required', count: counts.attention }
  ];

  if (authLoading || isLoading) {
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

  const filteredSubscriptions = getFilteredSubscriptions();

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Navbar />
      <main style={{ marginLeft: '260px', display: 'flex', padding: '0' }}>
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
              <Link href="/feed" style={{ color: '#1a1a2e', display: 'flex', alignItems: 'center' }}>
                {Icons.back()}
              </Link>
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
              <button style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                color: '#1a1a2e'
              }}>
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

        {/* Right Panel - Following Details */}
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
              FOLLOWING
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
                RECENT
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
                  {Icons.sliders()}
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

            {/* Filter Pills */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    border: activeFilter === filter.id
                      ? 'none'
                      : '1px solid #ddd',
                    background: activeFilter === filter.id
                      ? (filter.highlight ? '#f97316' : '#00aeef')
                      : 'white',
                    color: activeFilter === filter.id ? 'white' : '#1a1a2e',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {filter.label} {filter.count}
                </button>
              ))}
            </div>

            {/* Subscriptions Content */}
            {filteredSubscriptions.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {filteredSubscriptions.map((sub) => {
                  const isExpired = new Date(sub.expiresAt) <= new Date();
                  return (
                    <Link
                      key={sub.id}
                      href={`/profile/${sub.creator?.user?.username}`}
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        textDecoration: 'none',
                        color: '#1a1a2e',
                        border: '1px solid #eaeaea',
                        display: 'block'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        {/* Avatar */}
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: '#00aeef',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '18px'
                        }}>
                          {sub.creator?.user?.username?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            {sub.creator?.user?.username}
                            {Icons.verified()}
                          </div>
                          <div style={{ fontSize: '13px', color: '#8a96a3' }}>
                            @{sub.creator?.user?.username}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '12px',
                        borderTop: '1px solid #f0f0f0'
                      }}>
                        <span style={{ fontSize: '13px', color: '#8a96a3' }}>
                          {isExpired ? 'Expired' : 'Expires'}: {new Date(sub.expiresAt).toLocaleDateString()}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          background: isExpired ? '#fee2e2' : '#dcfce7',
                          color: isExpired ? '#dc2626' : '#16a34a'
                        }}>
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
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
                <Link
                  href="/feed"
                  style={{
                    marginTop: '16px',
                    padding: '10px 24px',
                    background: '#00aeef',
                    color: 'white',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Discover Creators
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
