'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AgeGateModal from '../components/AgeGateModal';
import SplashScreen from '../components/SplashScreen';
import { useAuthStore } from '../store/auth.store';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Hide splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Wait for splash to finish before routing
    if (!showSplash && !isLoading) {
      if (isAuthenticated && user?.ageVerified) {
        router.push('/feed');
      } else if (isAuthenticated && !user?.ageVerified) {
        setShowAgeGate(true);
      } else if (!isAuthenticated) {
        // Redirect to signup page
        router.push('/auth/signup');
      }
    }
  }, [showSplash, isLoading, isAuthenticated, user, router]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      {showAgeGate && <AgeGateModal />}
    </div>
  );
}

