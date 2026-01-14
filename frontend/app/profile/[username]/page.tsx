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
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0', marginLeft: '240px' }}>
        {/* Cover Image with Profile Info Overlay */}
        <div style={{ position: 'relative', background: 'white' }}>
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
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '20px',
          padding: '20px',
          alignItems: 'start'
        }}>
          {/* Posts Column */}
          <div>
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '20px',
              color: '#262626'
            }}>
              Posts
            </h2>
            {posts.length === 0 ? (
              <div style={{ 
                background: 'white',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                color: '#8e8e8e'
              }}>
                No posts available.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Subscription Sidebar */}
          {profile.creator && (
            <div style={{ position: 'sticky', top: '20px' }}>
              {/* Subscription Card */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#8e8e8e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '16px'
                }}>
                  SUBSCRIPTION
                </h3>

                {/* Limited Offer Banner */}
                <div style={{
                  background: '#fff4e6',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#262626'
                  }}>
                    Limited offer - 75% off for 31 days!
                  </h4>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    {profile.avatarUrl ? (
                      <img 
                        src={profile.avatarUrl} 
                        alt={username}
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        {username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        margin: 0,
                        marginBottom: '4px'
                      }}>
                        75% off for a very limited time ⚡ ⚡
                      </p>
                      <p style={{
                        fontSize: '13px',
                        color: '#666',
                        margin: 0,
                        lineHeight: '1.4'
                      }}>
                        A magical sight of MASSIVE BOOBS on the front page...and intriguing thoughts provoking conversation awaits...if you can handle it! Welcome to my world 😘
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subscribe Button */}
                {isSubscribed ? (
                  <button style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '25px',
                    border: 'none',
                    background: '#e0e0e0',
                    color: '#666',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'not-allowed',
                    marginBottom: '12px'
                  }}>
                    Subscribed ✓
                  </button>
                ) : (
                  <button 
                    onClick={() => {/* Handle subscribe */}}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '25px',
                      border: 'none',
                      background: '#00aff0',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginBottom: '12px',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#0099d6'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#00aff0'}
                  >
                    SUBSCRIBE ${(profile.creator.subscriptionFee * 0.25).toFixed(2)} for 31 days
                  </button>
                )}

                <p style={{
                  fontSize: '13px',
                  color: '#8e8e8e',
                  textAlign: 'center',
                  margin: 0
                }}>
                  Regular price ${profile.creator.subscriptionFee.toFixed(2)}/month
                </p>

                {/* Subscription Bundles */}
                <details style={{ marginTop: '24px' }}>
                  <summary style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#8e8e8e',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    padding: '12px 0',
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    SUBSCRIPTION BUNDLES
                  </summary>
                  <div style={{ paddingTop: '12px' }}>
                    <button style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '25px',
                      border: 'none',
                      background: '#00aff0',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginBottom: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>3 MONTHS (5% off)</span>
                      <span>${(profile.creator.subscriptionFee * 3 * 0.95).toFixed(2)} total</span>
                    </button>
                    <button style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '25px',
                      border: 'none',
                      background: '#00aff0',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>6 MONTHS (10% off)</span>
                      <span>${(profile.creator.subscriptionFee * 6 * 0.90).toFixed(2)} total</span>
                    </button>
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


