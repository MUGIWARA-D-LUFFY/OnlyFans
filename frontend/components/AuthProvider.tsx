'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { checkAuth, isLoading } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Optionally show a loading state while checking auth
    // This prevents flash of login page
    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #00aff0',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return <>{children}</>;
}
