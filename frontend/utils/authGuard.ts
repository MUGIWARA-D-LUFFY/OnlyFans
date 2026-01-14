import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';

export const useAuthGuard = (requireAgeVerification: boolean = false) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (requireAgeVerification && !user?.ageVerified) {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, user, requireAgeVerification, router]);

  return { user, isAuthenticated, isLoading };
};


