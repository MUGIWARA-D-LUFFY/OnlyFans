'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AgeGateModal from '../components/AgeGateModal';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/auth.store';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [showAgeGate, setShowAgeGate] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && user?.ageVerified) {
      router.push('/feed');
    } else if (isAuthenticated && !user?.ageVerified) {
      setShowAgeGate(true);
    }
  }, [isAuthenticated, user, router]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Navbar />
      {showAgeGate && <AgeGateModal />}
      <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <img src="/logo.png" alt="Logo" style={{ height: '80px', width: 'auto' }} />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 600,
            marginBottom: 'var(--spacing-lg)',
            color: 'var(--text-black)'
          }}>
            Welcome to Premium Content Platform
          </h1>
          <p className="text-body" style={{
            marginBottom: 'var(--spacing-xl)',
            color: 'var(--text-gray)'
          }}>
            Subscribe to your favorite creators and access exclusive content
          </p>
          {!isAuthenticated && (
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-lg)',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <a
                href="/auth/register"
                className="button-primary"
                style={{ display: 'inline-block' }}
              >
                Get Started
              </a>
              <a
                href="/auth/login"
                className="button-secondary"
                style={{ display: 'inline-block' }}
              >
                Login
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
