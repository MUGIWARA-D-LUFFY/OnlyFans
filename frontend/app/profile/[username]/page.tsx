'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import PostCard from '../../../components/PostCard';
import SubscribeButton from '../../../components/SubscribeButton';
import api from '../../../services/api';
import { postService } from '../../../services/post.service';
import { subscriptionService } from '../../../services/subscription.service';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
        <Navbar />
        <main className="feed-container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
          <div className="feed-main">
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <p className="text-meta">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
        <Navbar />
        <main className="feed-container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
          <div className="feed-main">
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <p className="text-meta">Profile not found</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', padding: '0 24px', gap: '24px' }}>
        <Navbar />
        <main style={{ 
          flex: 1,
          display: 'flex',
          padding: '0'
        }}>
        <div style={{ 
          flex: 1, 
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '0'
        }}>
          {/* Main Content Column */}
          <div style={{ minWidth: 0 }}>
        {/* Cover Image with Profile Info Overlay */}
        <div style={{ position: 'relative', background: 'white', borderRight: '1px solid #eaeaea' }}>
          {/* Cover Image */}
          <div style={{ 
            width: '100%', 
            height: '350px',
            background: profile.creator?.coverImageUrl 
              ? `url(${profile.creator.coverImageUrl}) center/cover` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative'
          }}>
            {/* Stats Overlay on Cover */}
            <div style={{ 
              position: 'absolute',
              top: '20px',
              left: '20px',
              display: 'flex',
              gap: '20px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>📸</span> {profile.creator?._count?.posts || 0}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>💬</span> 326
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>❤️</span> 405.3K
              </div>
            </div>
          </div>

          {/* Profile Info Section - overlaps cover */}
          <div style={{ 
            padding: '0 40px 30px',
            marginTop: '-60px',
            position: 'relative',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
              {/* Profile Avatar */}
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={username}
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
              ) : (
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  {username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}

              {/* Creator Name and Bio */}
              <div style={{ flex: 1, paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <h1 style={{ 
                    fontSize: '24px', 
                    fontWeight: 700,
                    margin: 0,
                    color: '#262626'
                  }}>
                    {username}
                  </h1>
                  {profile.creator?.verified && (
                    <span style={{ color: '#00d9ff', fontSize: '20px' }}>✓</span>
                  )}
                </div>
                <p style={{ 
                  fontSize: '14px',
                  color: '#8e8e8e',
                  margin: 0
                }}>
                  @{username}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '10px',
                paddingBottom: '10px'
              }}>
                <button style={{
                  padding: '10px 20px',
                  borderRadius: '25px',
                  border: '1px solid #e0e0e0',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  ⭐
                </button>
                <button style={{
                  padding: '10px 20px',
                  borderRadius: '25px',
                  border: '1px solid #e0e0e0',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  🔗
                </button>
                <button style={{
                  padding: '10px 20px',
                  borderRadius: '25px',
                  border: '1px solid #e0e0e0',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  ⋯
                </button>
              </div>
            </div>

            {/* Bio Text */}
            {profile.creator?.bio && (
              <p style={{ 
                marginTop: '20px',
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#262626',
                maxWidth: '600px'
              }}>
                {profile.creator.bio}
              </p>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ 
          padding: '20px 30px'
        }}>
          {/* Posts Section */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '16px',
              borderBottom: '1px solid #eaeaea',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#1a1a2e',
                  background: 'none',
                  border: 'none',
                  padding: '8px 0',
                  cursor: 'pointer',
                  borderBottom: '2px solid #00aeef'
                }}>
                  {profile.creator?._count?.posts || 0} POSTS
                </button>
                <button style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#8a96a3',
                  background: 'none',
                  border: 'none',
                  padding: '8px 0',
                  cursor: 'pointer'
                }}>
                  940 MEDIA
                </button>
              </div>
            </div>
            {posts.length === 0 ? (
              <div style={{ 
                background: 'white',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                color: '#8a96a3'
              }}>
                No posts available.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
        </div>

          {/* Subscription Sidebar - Right Column */}
          {profile.creator && (
            <div style={{ 
              background: 'white',
              borderLeft: '1px solid #eaeaea',
              padding: '20px 24px',
              position: 'sticky',
              top: 0,
              height: '100vh',
              overflowY: 'auto'
            }}>
              {/* Subscription Card */}
              <div>
                <h3 style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#8a96a3',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '16px'
                }}>
                  SUBSCRIPTION
                </h3>

                {/* Limited Offer Banner */}
                <div style={{
                  background: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <h4 style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Limited offer - 20% off for 31 days!
                  </h4>
                  <p style={{
                    fontSize: '12px',
                    color: '#8a96a3',
                    margin: '0 0 12px 0'
                  }}>
                    Offer ends Jan 21
                  </p>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    {profile.avatarUrl ? (
                      <img 
                        src={profile.avatarUrl} 
                        alt={username}
                        style={{ 
                          width: '36px', 
                          height: '36px', 
                          borderRadius: '50%',
                          objectFit: 'cover',
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        background: '#00aeef',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        margin: 0,
                        color: '#1a1a2e',
                        lineHeight: '1.4'
                      }}>
                        Eight minute oral 😈 $40 if you missed - YOU TIP $40 (Some of you need to learn to read 🤷)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subscribe Button */}
                {isSubscribed ? (
                  <button style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '25px',
                    border: 'none',
                    background: '#e0e0e0',
                    color: '#666',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'not-allowed',
                    marginBottom: '8px'
                  }}>
                    Subscribed ✓
                  </button>
                ) : (
                  <button 
                    onClick={() => {/* Handle subscribe */}}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '25px',
                      border: 'none',
                      background: '#00aeef',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginBottom: '8px',
                      transition: 'background 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingLeft: '20px',
                      paddingRight: '20px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#0099d6'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#00aeef'}
                  >
                    <span>SUBSCRIBE</span>
                    <span>${(profile.creator.subscriptionFee * 0.8).toFixed(2)} for 31 days</span>
                  </button>
                )}

                <p style={{
                  fontSize: '12px',
                  color: '#8a96a3',
                  textAlign: 'center',
                  margin: 0
                }}>
                  Regular price ${profile.creator.subscriptionFee.toFixed(2)} /month
                </p>

                {/* Subscription Bundles */}
                <details style={{ marginTop: '20px' }}>
                  <summary style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#8a96a3',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    padding: '12px 0',
                    borderTop: '1px solid #eaeaea',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>SUBSCRIPTION BUNDLES</span>
                    <span style={{ fontSize: '18px' }}>›</span>
                  </summary>
                  <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '25px',
                      border: 'none',
                      background: '#00aeef',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#0099d6'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#00aeef'}
                    >
                      <span>3 MONTHS (10% off)</span>
                      <span>${(profile.creator.subscriptionFee * 3 * 0.90).toFixed(2)} total</span>
                    </button>
                    <button style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '25px',
                      border: 'none',
                      background: '#00aeef',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#0099d6'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#00aeef'}
                    >
                      <span>6 MONTHS (15% off)</span>
                      <span>${(profile.creator.subscriptionFee * 6 * 0.85).toFixed(2)} total</span>
                    </button>
                  </div>
                </details>

                {/* Footer Links */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  alignItems: 'center',
                  fontSize: '11px',
                  color: '#8a96a3',
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: '1px solid #eaeaea'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href="#" style={{ color: '#8a96a3', textDecoration: 'none' }}>Privacy</a>
                    <span>·</span>
                    <a href="#" style={{ color: '#8a96a3', textDecoration: 'none' }}>Cookie Notice</a>
                    <span>·</span>
                    <a href="#" style={{ color: '#8a96a3', textDecoration: 'none' }}>Terms of Service</a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}


