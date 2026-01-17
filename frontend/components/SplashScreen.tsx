'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Fade out after animation completes
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeOut 0.5s ease-out 2s forwards'
    }}>
      <style jsx>{`
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .logo-container {
          animation: scaleIn 0.6s ease-out;
        }
      `}</style>
      
      <div className="logo-container" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
      }}>
        {/* Logo Icon */}
        <img 
          src="/logo.png" 
          alt="OnlyFans Logo" 
          width="120" 
          height="120"
          style={{ objectFit: 'contain' }}
        />
        
        {/* OnlyFans Text */}
        <div style={{
          fontSize: '72px',
          fontWeight: 'bold',
          color: '#00AFF0',
          letterSpacing: '-1px'
        }}>
          OnlyFans
        </div>
      </div>
    </div>
  );
}
