'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import MessageBox from '../../components/MessageBox';
import NewConversationModal from '../../components/NewConversationModal';
import api from '../../services/api';
import { useAuthGuard } from '../../utils/authGuard';
import { subscriptionService } from '../../services/subscription.service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Icons
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
  pencil: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  )
};

interface Conversation {
  otherUser: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  lastMessage?: string;
  unreadCount: number;
  lastMessageAt?: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthGuard(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscriptions, setHasSubscriptions] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [conversationsRes, subscriptionsRes] = await Promise.all([
          api.get('/messages/conversations').catch(() => ({ data: [] })),
          subscriptionService.getUserSubscriptions().catch(() => [])
        ]);

        setConversations(conversationsRes.data);
        setHasSubscriptions(subscriptionsRes.length > 0);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const response = await api.get(`/messages/conversation/${selectedConversation}`);
          setMessages(response.data);
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      };
      fetchMessages();
    }
  }, [selectedConversation]);

  const getSelectedUser = () => {
    const conv = conversations.find(c => c.otherUser.id === selectedConversation);
    return conv?.otherUser;
  };

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter((conv) => {
      if (!searchQuery.trim()) return true;
      return conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (!a.lastMessageAt || !b.lastMessageAt) return 0;
      const dateA = new Date(a.lastMessageAt).getTime();
      const dateB = new Date(b.lastMessageAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const handleNewConversation = (userId: string) => {
    setSelectedConversation(userId);
  };

  if (authLoading || isLoading) {
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
        <main style={{ flex: 1, display: 'flex', padding: '0', height: '100vh' }}>
          {/* Left Panel - Conversations List */}
          <div style={{
            width: '360px',
            borderRight: '1px solid #eaeaea',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh'
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
                  MESSAGES
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
                <button
                  onClick={() => setShowNewConversationModal(true)}
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
                  placeholder="Search conversations..."
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

            {/* Sort Dropdown */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px',
              borderBottom: '1px solid #eaeaea'
            }}>
              <span style={{ fontSize: '13px', color: '#8a96a3', fontWeight: 500, textTransform: 'uppercase' }}>
                {sortOrder === 'newest' ? 'NEWEST FIRST' : 'OLDEST FIRST'}
              </span>
              <button
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {Icons.sort()}
              </button>
            </div>

            {/* Filter Pills */}
            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '12px 20px',
              borderBottom: '1px solid #eaeaea',
              alignItems: 'center'
            }}>
              <button
                onClick={() => setActiveFilter('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  border: 'none',
                  background: activeFilter === 'all' ? '#00aeef' : '#f0f0f0',
                  color: activeFilter === 'all' ? 'white' : '#1a1a2e',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                All
              </button>
              <button style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {Icons.pencil()}
              </button>
            </div>

            {/* Conversations List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredConversations.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 20px',
                  textAlign: 'center',
                  height: '100%'
                }}>
                  <p style={{ color: '#8a96a3', fontSize: '14px' }}>
                    {searchQuery ? 'No conversations match your search' : 'Nothing found'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.otherUser.id}
                    onClick={() => setSelectedConversation(conv.otherUser.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      background: selectedConversation === conv.otherUser.id ? '#f0f8ff' : 'transparent',
                      borderLeft: selectedConversation === conv.otherUser.id ? '3px solid #00aeef' : '3px solid transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: conv.otherUser.avatarUrl
                        ? `url(${conv.otherUser.avatarUrl}) center/cover`
                        : '#00aeef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>
                      {!conv.otherUser.avatarUrl && conv.otherUser.username[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#1a1a2e',
                        marginBottom: '4px'
                      }}>
                        {conv.otherUser.username}
                      </div>
                      {conv.lastMessage && (
                        <div style={{
                          fontSize: '13px',
                          color: '#8a96a3',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {typeof conv.lastMessage === 'object' ? (conv.lastMessage as any).content : conv.lastMessage}
                        </div>
                      )}
                    </div>

                    {/* Unread Badge */}
                    {conv.unreadCount > 0 && (
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: '#00aeef',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Chat or Empty State */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 24px',
                  borderBottom: '1px solid #eaeaea'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#00aeef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {getSelectedUser()?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>
                      {getSelectedUser()?.username}
                    </div>
                    <div style={{ fontSize: '13px', color: '#22c55e' }}>Online</div>
                  </div>
                </div>

                {/* Messages Container */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {messages.length === 0 ? (
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8a96a3'
                    }}>
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '18px',
                          background: msg.senderId === user?.id ? '#00aeef' : '#f0f0f0',
                          color: msg.senderId === user?.id ? 'white' : '#1a1a2e',
                          alignSelf: msg.senderId === user?.id ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          fontSize: '14px'
                        }}
                      >
                        {msg.content}
                        {msg.isPaid && (
                          <div style={{
                            fontSize: '11px',
                            marginTop: '4px',
                            opacity: 0.8
                          }}>
                            💰 ${msg.price}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #eaeaea' }}>
                  <MessageBox
                    receiverId={selectedConversation}
                    onMessageSent={() => {
                      api.get(`/messages/conversation/${selectedConversation}`).then((res) => {
                        setMessages(res.data);
                      });
                    }}
                  />
                </div>
              </>
            ) : (
              /* Empty State - Subscribe Prompt */
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                textAlign: 'center'
              }}>
                {!hasSubscriptions ? (
                  <>
                    <p style={{
                      fontSize: '16px',
                      color: '#1a1a2e',
                      maxWidth: '300px',
                      lineHeight: '1.5'
                    }}>
                      Please subscribe to a creator to access this feature.
                    </p>
                    <Link
                      href="/feed"
                      style={{
                        marginTop: '20px',
                        padding: '12px 28px',
                        background: '#00aeef',
                        color: 'white',
                        borderRadius: '25px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    >
                      Discover Creators
                    </Link>
                  </>
                ) : (
                  <p style={{
                    fontSize: '16px',
                    color: '#8a96a3'
                  }}>
                    Select a conversation to start messaging
                  </p>
                )}
              </div>
            )}
          </div>
        </main>

        {/* New Conversation Modal */}
        <NewConversationModal
          isOpen={showNewConversationModal}
          onClose={() => setShowNewConversationModal(false)}
          onConversationStarted={handleNewConversation}
        />
      </div>
    </div>
  );
}

