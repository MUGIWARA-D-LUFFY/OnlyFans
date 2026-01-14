'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import SubscribeButton from '../../../components/SubscribeButton';
import api from '../../../services/api';
import { paymentService } from '../../../services/payment.service';
import { useAuthGuard } from '../../../utils/authGuard';

export default function SubscribePage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params.creatorId as string;
  const { user } = useAuthGuard(true);
  const [creator, setCreator] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const response = await api.get(`/creators/${creatorId}`);
        setCreator(response.data);
      } catch (error) {
        console.error('Failed to fetch creator:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (creatorId) {
      fetchCreator();
    }
  }, [creatorId]);

  const handleSubscribe = async () => {
    try {
      await paymentService.subscribe(creatorId);
      router.push(`/profile/${creator?.user?.username}`);
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
        <Navbar />
        <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <p className="text-meta">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!creator) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
        <Navbar />
        <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <p className="text-meta">Creator not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Navbar />
      <main className="container" style={{ maxWidth: '600px', paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
        <div className="card">
          <h1 className="text-title" style={{ marginBottom: 'var(--spacing-lg)', fontSize: '24px' }}>
            Subscribe to @{creator.user.username}
          </h1>
          <p className="text-body" style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--text-gray)' }}>
            {creator.bio}
          </p>
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <p className="text-title" style={{ fontSize: '28px', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
              ${creator.subscriptionFee}/month
            </p>
            <p className="text-meta">Get access to exclusive content</p>
          </div>
          <SubscribeButton
            creatorId={creator.id}
            subscriptionFee={creator.subscriptionFee}
            isSubscribed={false}
            onSubscribeChange={handleSubscribe}
          />
        </div>
      </main>
    </div>
  );
}


