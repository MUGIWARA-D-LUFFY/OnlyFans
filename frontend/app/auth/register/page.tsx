'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import '../signup.css';
import { useAuthStore } from '../../../store/auth.store';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { register } = useAuthStore();

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await register(email, password, name);
            router.push('/feed');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <section className="signup-hero">
                {/* Left Column - Landing/Branding */}
                <div className="landing-panel">
                    <div className="landing-content">
                        <div className="landing-logo">
                            <img src="/logo.png" alt="Logo" />
                            <span className="landing-logo-text">OnlyFans</span>
                        </div>

                        <h1 className="landing-headline">
                            Complete your registration
                        </h1>

                        <p className="landing-subheadline">
                            Just a few more details to get you started on your journey.
                        </p>
                    </div>
                </div>

                {/* Right Column - Register Form */}
                <div className="signup-panel">
                    <div className="signup-panel-inner">
                        <div className="signup-mobile-logo">
                            <img src="/logo.png" alt="Logo" />
                        </div>

                        <h2 className="signup-headline">Create your account</h2>
                        <p className="signup-subheadline">
                            Fill in your details below
                        </p>

                        <form className="signup-form" onSubmit={handleSubmit}>
                            {error && (
                                <div style={{
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    fontSize: '14px'
                                }}>
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="name">Display Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="form-input"
                                    placeholder="Enter your display name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        className="form-input"
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{ paddingRight: '48px' }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    className="form-input"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="signup-button"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating account...' : 'Create account'}
                            </button>
                        </form>

                        <div className="secondary-links">
                            <Link href="/auth/login" className="secondary-link">
                                Already have an account? Log in
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="signup-footer">
                <div className="footer-links">
                    <Link href="/about" className="footer-link">About</Link>
                    <div className="footer-divider" />
                    <Link href="/help" className="footer-link">Help</Link>
                    <div className="footer-divider" />
                    <Link href="/terms" className="footer-link">Terms of Service</Link>
                    <div className="footer-divider" />
                    <Link href="/privacy" className="footer-link">Privacy Policy</Link>
                    <div className="footer-divider" />
                    <Link href="/contact" className="footer-link">Contact</Link>
                    <div className="footer-divider" />
                    <span className="footer-link">© 2026</span>
                </div>
            </footer>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterForm />
        </Suspense>
    );
}
