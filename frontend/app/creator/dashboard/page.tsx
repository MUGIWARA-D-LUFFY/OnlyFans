'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import { useAuthGuard } from '../../../utils/authGuard';
import api from '../../../services/api';

export default function CreatorDashboardPage() {
  const { user } = useAuthGuard(true);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.creator?.id) {
        try {
          const [earningsRes, subscribersRes] = await Promise.all([
            api.get(`/creators/${user.creator.id}/earnings`),
            api.get(`/subscriptions/creator/${user.creator.id}`),
          ]);
          setStats({
            earnings: earningsRes.data,
            subscribers: subscribersRes.data,
          });
        } catch (error) {
          console.error('Failed to fetch stats:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchStats();
  }, [user]);

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Navbar />
      <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
        <h1 className="text-title" style={{ marginBottom: 'var(--spacing-xl)', fontSize: '24px' }}>
          Creator Dashboard
        </h1>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <div className="card">
            <h3 className="text-body" style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>
              Total Earnings
            </h3>
            <p className="text-title" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary-blue)' }}>
              ${stats?.earnings?.totalEarnings?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="card">
            <h3 className="text-body" style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>
              Subscribers
            </h3>
            <p className="text-title" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary-blue)' }}>
              {stats?.subscribers?.length || 0}
            </p>
          </div>
          <div className="card">
            <h3 className="text-body" style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>
              Transactions
            </h3>
            <p className="text-title" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary-blue)' }}>
              {stats?.earnings?.transactionCount || 0}
            </p>
          </div>
        </div>
        <div className="card">
          <h2 className="text-title" style={{ marginBottom: 'var(--spacing-lg)', fontSize: '18px' }}>
            Recent Transactions
          </h2>
          {stats?.earnings?.transactions?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {stats.earnings.transactions.slice(0, 10).map((tx: any) => (
                <div 
                  key={tx.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: 'var(--spacing-md)',
                    background: 'var(--light-gray)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <span className="text-body" style={{ fontWeight: 500 }}>
                    ${tx.amount.toFixed(2)}
                  </span>
                  <span className="text-meta">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-meta">No transactions yet</p>
          )}
        </div>
      </main>
    </div>
  );
}


