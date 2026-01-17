'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { useAuthGuard } from '../../../utils/authGuard';
import { postService } from '../../../services/post.service';

// Helper to convert Google Drive view links to direct embed links (reused logic)
const getEmbedUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=s2000`;
    }
  }
  return url;
};

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuthGuard(true);
  const [title, setTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isPaid, setIsPaid] = useState(false);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'SUBSCRIBERS' | 'PAID'>('PUBLIC');
  const [price, setPrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (mediaUrl) {
      setPreviewUrl(getEmbedUrl(mediaUrl));
    } else {
      setPreviewUrl('');
    }
  }, [mediaUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.creator?.id) {
      // Fallback if creator profile is missing, should be caught by route protection but just in case
      alert('Creator profile missing. Please log in properly.');
      return;
    }

    setIsLoading(true);
    try {
      await postService.createPost(user.creator.id, {
        title,
        mediaUrl,
        mediaType,
        isPaid: visibility === 'PAID',
        price: visibility === 'PAID' ? parseFloat(price) : undefined,
        visibility,
      });
      router.push('/creator/dashboard');
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex' }}>
        <Navbar />

        <main style={{ flex: 1, maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
              New Post
            </h1>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #eaeaea',
            overflow: 'hidden'
          }}>
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>

              {/* Title / Caption */}
              <div style={{ marginBottom: '24px' }}>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Compose new post..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    border: 'none',
                    resize: 'none',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    color: '#1a1a2e'
                  }}
                />
              </div>

              {/* Media URL Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8a96a3', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Media URL (Google Drive Supported)
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f8f9fa',
                  border: '1px solid #eaeaea',
                  borderRadius: '8px',
                  padding: '0 12px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2" style={{ marginRight: '8px' }}>
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                  </svg>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="Paste image or video link here"
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '14px',
                      outline: 'none',
                      color: '#1a1a2e'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Media Preview */}
              {previewUrl && (
                <div style={{
                  marginBottom: '24px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#000',
                  position: 'relative',
                  border: '1px solid #eaeaea'
                }}>
                  {mediaType === 'image' ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ width: '100%', display: 'block' }}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
                      <p>Video Preview: {mediaUrl}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Settings Row */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                {/* Media Type */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8a96a3', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Type
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setMediaType('image')}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: mediaType === 'image' ? '1px solid #00aeef' : '1px solid #eaeaea',
                        background: mediaType === 'image' ? '#e6f7ff' : 'white',
                        color: mediaType === 'image' ? '#00aeef' : '#8a96a3',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType('video')}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: mediaType === 'video' ? '1px solid #00aeef' : '1px solid #eaeaea',
                        background: mediaType === 'video' ? '#e6f7ff' : 'white',
                        color: mediaType === 'video' ? '#00aeef' : '#8a96a3',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Video
                    </button>
                  </div>
                </div>

                {/* Access Selection */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8a96a3', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Access
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPaid(false);
                        setVisibility('PUBLIC');
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: visibility === 'PUBLIC' ? '1px solid #00aeef' : '1px solid #eaeaea',
                        background: visibility === 'PUBLIC' ? '#e6f7ff' : 'white',
                        color: visibility === 'PUBLIC' ? '#00aeef' : '#8a96a3',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPaid(false);
                        setVisibility('SUBSCRIBERS');
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: visibility === 'SUBSCRIBERS' ? '1px solid #00aeef' : '1px solid #eaeaea',
                        background: visibility === 'SUBSCRIBERS' ? '#e6f7ff' : 'white',
                        color: visibility === 'SUBSCRIBERS' ? '#00aeef' : '#8a96a3',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Subs Only
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPaid(true);
                        setVisibility('PAID');
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: visibility === 'PAID' ? '1px solid #00aeef' : '1px solid #eaeaea',
                        background: visibility === 'PAID' ? '#e6f7ff' : 'white',
                        color: visibility === 'PAID' ? '#00aeef' : '#8a96a3',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Paid (PPV)
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Input (Conditional) */}
              {isPaid && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8a96a3', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #00aeef',
                      fontSize: '16px',
                      outline: 'none',
                      color: '#1a1a2e'
                    }}
                    required={isPaid}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !mediaUrl}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '25px',
                  background: isLoading || !mediaUrl ? '#bae6fd' : '#00aeef',
                  color: 'white',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  cursor: isLoading || !mediaUrl ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  letterSpacing: '0.5px'
                }}
              >
                {isLoading ? 'Posting...' : 'Post'}
              </button>

            </form>
          </div>
        </main>
      </div>


    </div>
  );
}
