'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import { useAuthGuard } from '../../../utils/authGuard';
import api from '../../../services/api';

// Helper to convert Google Drive view links to direct embed links
const getEmbedUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=s400`; // fetching smaller thumbnail for dashboard
    }
  }
  return url;
};

export default function CreatorDashboardPage() {
  const { user } = useAuthGuard(true);
  const [stats, setStats] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Settings State
  const [subscriptionFee, setSubscriptionFee] = useState('');
  const [isUpdatingFee, setIsUpdatingFee] = useState(false);

  // Edit Post State
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editPrice, setEditPrice] = useState('');

  const fetchData = async () => {
    if (user?.creator?.id) {
      try {
        const [earningsRes, subscribersRes, creatorRes, postsRes] = await Promise.all([
          api.get(`/creators/${user.creator.id}/earnings`),
          api.get(`/subscriptions/creator/${user.creator.id}`),
          api.get(`/creators/${user.creator.id}`),
          api.get(`/posts/creator/${user.creator.id}?limit=20`),
        ]);

        setStats({
          earnings: earningsRes.data,
          subscribers: subscribersRes.data,
          creator: creatorRes.data,
        });
        setSubscriptionFee(creatorRes.data.subscriptionFee?.toString() || '0');
        setPosts(postsRes.data.posts);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleUpdateFee = async () => {
    if (!user?.creator?.id) return;
    setIsUpdatingFee(true);
    try {
      await api.patch('/creators/profile', {
        subscriptionFee: parseFloat(subscriptionFee)
      });
      alert('Subscription fee updated!');
    } catch (error) {
      console.error('Failed to update fee:', error);
      alert('Failed to update subscription fee');
    } finally {
      setIsUpdatingFee(false);
    }
  };

  const handleUpdatePost = async (post: any) => {
    const isPaid = post.visibility === 'PAID';
    try {
      await api.patch(`/posts/${post.id}`, {
        visibility: post.visibility,
        isPaid,
        price: isPaid ? parseFloat(editPrice || post.price || '0') : undefined
      });
      setEditingPost(null);
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--white)', display: 'flex' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '40px' }}>
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <p className="text-meta">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 className="text-title" style={{ marginBottom: 'var(--spacing-xl)', fontSize: '24px' }}>
          Creator Dashboard
        </h1>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <div className="card">
            <h3 className="text-body" style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>Total Earnings</h3>
            <p className="text-title" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary-blue)' }}>
              ${stats?.earnings?.totalEarnings?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="card">
            <h3 className="text-body" style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>Subscribers</h3>
            <p className="text-title" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary-blue)' }}>
              {stats?.subscribers?.length || 0}
            </p>
          </div>
          <div className="card">
            <h3 className="text-body" style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>Transactions</h3>
            <p className="text-title" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary-blue)' }}>
              {stats?.earnings?.transactionCount || 0}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>

          {/* Settings Section */}
          <div className="card" style={{ height: 'fit-content' }}>
            <h2 className="text-title" style={{ marginBottom: '20px', fontSize: '18px' }}>Settings</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8a96a3', marginBottom: '8px' }}>
                SUBSCRIPTION PRICE ($ / Month)
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={subscriptionFee}
                  onChange={(e) => setSubscriptionFee(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #eaeaea',
                    borderRadius: '8px'
                  }}
                />
                <button
                  onClick={handleUpdateFee}
                  disabled={isUpdatingFee}
                  style={{
                    padding: '10px 20px',
                    background: '#00aeef',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Manage Posts Section */}
          <div className="card">
            <h2 className="text-title" style={{ marginBottom: '20px', fontSize: '18px' }}>Manage Posts</h2>

            {posts.length === 0 ? (
              <p className="text-meta">No posts yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {posts.map(post => (
                  <div key={post.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #eaeaea'
                  }}>
                    {/* Thumbnail */}
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#ddd', overflow: 'hidden' }}>
                      {post.mediaType === 'image' ? (
                        <img
                          src={getEmbedUrl(post.mediaUrl || post.previewUrl)}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📺</div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '14px' }}>
                        {post.title || 'Untitled Post'}
                      </p>

                      {editingPost?.id === post.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                          <select
                            value={editingPost.visibility}
                            onChange={(e) => setEditingPost({ ...editingPost, visibility: e.target.value })}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                          >
                            <option value="PUBLIC">Public (Free)</option>
                            <option value="SUBSCRIBERS">Subscribers</option>
                            <option value="PAID">Paid (PPV)</option>
                          </select>

                          {editingPost.visibility === 'PAID' && (
                            <input
                              type="number"
                              placeholder="Price"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                          )}

                          <button onClick={() => handleUpdatePost(editingPost)} style={{ fontSize: '12px', color: '#00aeef', cursor: 'pointer', border: 'none', background: 'none', fontWeight: 600 }}>SAVE</button>
                          <button onClick={() => setEditingPost(null)} style={{ fontSize: '12px', color: '#666', cursor: 'pointer', border: 'none', background: 'none' }}>CANCEL</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '12px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: post.isPaid ? '#fff0f0' : post.visibility === 'SUBSCRIBERS' ? '#f0f7ff' : '#f0fff4',
                            color: post.isPaid ? '#ef4444' : post.visibility === 'SUBSCRIBERS' ? '#00aeef' : '#10b981',
                            fontWeight: 600
                          }}>
                            {post.isPaid ? `PAID ($${post.price})` : post.visibility === 'SUBSCRIBERS' ? 'SUBS ONLY' : 'FREE'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#8a96a3' }}>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {editingPost?.id !== post.id && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setEditPrice(post.price?.toString() || '');
                          }}
                          style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          style={{ padding: '6px 12px', border: '1px solid #fee2e2', borderRadius: '6px', background: '#fff1f2', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
