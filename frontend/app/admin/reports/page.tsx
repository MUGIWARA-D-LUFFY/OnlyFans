'use client';

import Navbar from '../../../components/Navbar';
import { useAuthGuard } from '../../../utils/authGuard';

export default function AdminReportsPage() {
  const { user } = useAuthGuard(true);

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Navbar />
      <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
        <h1 className="text-title" style={{ marginBottom: 'var(--spacing-xl)', fontSize: '24px' }}>
          Reports & Moderation
        </h1>
        <div className="card">
          <p className="text-meta">No reports available</p>
        </div>
      </main>
    </div>
  );
}



