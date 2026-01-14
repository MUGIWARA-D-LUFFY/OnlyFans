'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import { useAuthGuard } from '../../../utils/authGuard';
import api from '../../../services/api';

export default function EarningsPage() {
  const { user } = useAuthGuard(true);
  const [earnings, setEarnings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (user?.creator?.id) {
        try {
          const response = await api.get(`/creators/${user.creator.id}/earnings`);
          setEarnings(response.data);
        } catch (error) {
          console.error('Failed to fetch earnings:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchEarnings();
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
          Earnings
        </h1>
        <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h2 className="text-title" style={{ marginBottom: 'var(--spacing-lg)', fontSize: '20px' }}>
            Total Earnings
          </h2>
          <p className="text-title" style={{ fontSize: '36px', fontWeight: 600, color: 'var(--primary-blue)', marginBottom: 'var(--spacing-sm)' }}>
            ${earnings?.totalEarnings?.toFixed(2) || '0.00'}
          </p>
          <p className="text-meta">
            {earnings?.transactionCount || 0} transactions
          </p>
        </div>
        <div className="card">
          <h2 className="text-title" style={{ marginBottom: 'var(--spacing-lg)', fontSize: '20px' }}>
            Transaction History
          </h2>
          {earnings?.transactions?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {earnings.transactions.map((tx: any) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--spacing-lg)',
                    background: 'var(--light-gray)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div>
                    <p className="text-body" style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                      ${tx.amount.toFixed(2)}
                    </p>
                    <p className="text-meta">{tx.type}</p>
                  </div>
                  <p className="text-meta">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
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


