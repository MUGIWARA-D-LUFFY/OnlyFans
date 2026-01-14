'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { useAuthGuard } from '../../../utils/authGuard';
import { postService } from '../../../services/post.service';
import api from '../../../services/api';

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuthGuard(true);
  const [title, setTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.creator?.id) return;

    setIsLoading(true);
    try {
      await postService.createPost(user.creator.id, {
        title,
        mediaUrl,
        mediaType,
        isPaid,
        price: isPaid ? price : undefined,
      });
      router.push('/creator/dashboard');
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to upload post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Navbar />
      <main className="container" style={{ maxWidth: '600px', paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
        <h1 className="text-title" style={{ marginBottom: 'var(--spacing-xl)', fontSize: '24px' }}>
          Upload Content
        </h1>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ 
                display: 'block',
                fontSize: 'var(--meta)',
                fontWeight: 500,
                marginBottom: 'var(--spacing-sm)',
                color: 'var(--text-black)'
              }}>
                Title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ 
                display: 'block',
                fontSize: 'var(--meta)',
                fontWeight: 500,
                marginBottom: 'var(--spacing-sm)',
                color: 'var(--text-black)'
              }}>
                Media URL
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ 
                display: 'block',
                fontSize: 'var(--meta)',
                fontWeight: 500,
                marginBottom: 'var(--spacing-sm)',
                color: 'var(--text-black)'
              }}>
                Media Type
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-sm)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: 'var(--primary-blue)'
                  }}
                />
                <span className="text-body">Paid Content (PPV)</span>
              </label>
            </div>
            {isPaid && (
              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: 'var(--meta)',
                  fontWeight: 500,
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--text-black)'
                }}>
                  Price
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                  required={isPaid}
                />
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="button-primary"
              style={{ 
                width: '100%',
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}


