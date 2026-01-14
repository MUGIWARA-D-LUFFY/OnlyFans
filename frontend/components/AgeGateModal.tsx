'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';

export default function AgeGateModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  const { verifyAge, user } = useAuthStore();

  const handleVerify = async () => {
    if (user) {
      try {
        await verifyAge();
        setIsVerified(true);
        setIsOpen(false);
      } catch (error) {
        console.error('Age verification failed:', error);
      }
    } else {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="card" style={{
        maxWidth: '400px',
        width: '100%',
        margin: '0 var(--spacing-lg)',
        textAlign: 'center'
      }}>
        <h2 className="text-title" style={{ 
          marginBottom: 'var(--spacing-lg)',
          fontSize: '20px'
        }}>
          Age Verification Required
        </h2>
        <p className="text-body" style={{ 
          marginBottom: 'var(--spacing-xl)',
          color: 'var(--text-gray)'
        }}>
          You must be 18 years or older to access this content.
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
          <button
            onClick={() => router.push('/')}
            className="button-secondary"
            style={{ flex: 1 }}
          >
            Exit
          </button>
          <button
            onClick={handleVerify}
            className="button-primary"
            style={{ flex: 1 }}
          >
            I am 18+
          </button>
        </div>
      </div>
    </div>
  );
}


