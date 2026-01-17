'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../services/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Password reset instructions have been sent to your email.');
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            border: '1px solid #eaeaea',
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back
        </button>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          marginBottom: '8px',
          color: '#1a1a2e'
        }}>
          Forgot Password?
        </h1>
        
        <p style={{
          fontSize: '14px',
          color: '#8a96a3',
          marginBottom: '30px'
        }}>
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        {message && (
          <div style={{
            padding: '12px',
            background: '#d1fae5',
            color: '#059669',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              color: '#1a1a2e'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #eaeaea',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '25px',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: isLoading ? 'wait' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#8a96a3'
        }}>
          Remember your password?{' '}
          <a
            href="/auth/login"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
