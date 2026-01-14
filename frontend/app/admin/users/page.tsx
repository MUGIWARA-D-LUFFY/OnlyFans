'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import { useAuthGuard } from '../../../utils/authGuard';
import api from '../../../services/api';

export default function AdminUsersPage() {
  const { user } = useAuthGuard(true);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        setUsers(response.data.users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Navbar />
      <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
        <h1 className="text-title" style={{ marginBottom: 'var(--spacing-xl)', fontSize: '24px' }}>
          User Management
        </h1>
        <div className="card">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <p className="text-meta">Loading...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-gray)' }}>
                    <th style={{ textAlign: 'left', padding: 'var(--spacing-md)', fontSize: 'var(--meta)', fontWeight: 600 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 'var(--spacing-md)', fontSize: 'var(--meta)', fontWeight: 600 }}>Username</th>
                    <th style={{ textAlign: 'left', padding: 'var(--spacing-md)', fontSize: 'var(--meta)', fontWeight: 600 }}>Role</th>
                    <th style={{ textAlign: 'left', padding: 'var(--spacing-md)', fontSize: 'var(--meta)', fontWeight: 600 }}>Age Verified</th>
                    <th style={{ textAlign: 'left', padding: 'var(--spacing-md)', fontSize: 'var(--meta)', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-gray)' }}>
                      <td className="text-body" style={{ padding: 'var(--spacing-md)' }}>{u.email}</td>
                      <td className="text-body" style={{ padding: 'var(--spacing-md)' }}>{u.username || '-'}</td>
                      <td className="text-body" style={{ padding: 'var(--spacing-md)' }}>{u.role}</td>
                      <td className="text-body" style={{ padding: 'var(--spacing-md)' }}>{u.ageVerified ? 'Yes' : 'No'}</td>
                      <td style={{ padding: 'var(--spacing-md)' }}>
                        <button 
                          style={{ 
                            color: '#ef4444',
                            cursor: 'pointer',
                            transition: 'var(--transition-fast)',
                            background: 'transparent',
                            border: 'none',
                            textDecoration: 'underline'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


