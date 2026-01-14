'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import { useAuthGuard } from '../../../utils/authGuard';
import api from '../../../services/api';

export default function AdminDashboardPage() {
  const { user } = useAuthGuard(true);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
        <Navbar />
        <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <p className="text-meta">Access denied</p>
          </div>
        </main>
      </div>
    );
  }

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
          Admin Dashboard
        </h1>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-lg)'
        }}>
          <div className="card">
            <h3 className="text-body" style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>
              Total Users
            </h3>
            <p className="text-title" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary-blue)' }}>
              {stats?.totalUsers || 0}
            </p>
          </div>
          <div className="card">
            <h3 className="text-body" style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>
              Total Creators
            </h3>
            <p className="text-title" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary-blue)' }}>
              {stats?.totalCreators || 0}
            </p>
          </div>
          <div className="card">
            <h3 className="text-body" style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>
              Total Posts
            </h3>
            <p className="text-title" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary-blue)' }}>
              {stats?.totalPosts || 0}
            </p>
          </div>
          <div className="card">
            <h3 className="text-body" style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>
              Active Subscriptions
            </h3>
            <p className="text-title" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary-blue)' }}>
              {stats?.activeSubscriptions || 0}
            </p>
          </div>
          <div className="card">
            <h3 className="text-body" style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>
              Total Revenue
            </h3>
            <p className="text-title" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary-blue)' }}>
              ${stats?.totalRevenue?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="card">
            <h3 className="text-body" style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>
              Total Transactions
            </h3>
            <p className="text-title" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary-blue)' }}>
              {stats?.totalTransactions || 0}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}


