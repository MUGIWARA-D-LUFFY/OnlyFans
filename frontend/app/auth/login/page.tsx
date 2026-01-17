'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../signup.css';
import { useAuthStore } from '../../../store/auth.store';

// Icons
const Icons = {
    eye: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    eyeOff: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ),
    twitter: () => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    google: () => (
        <svg viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    ),
    apple: () => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
    ),
    verified: () => (
        <svg viewBox="0 0 24 24" className="verified-badge">
            <circle cx="12" cy="12" r="10" fill="#00AFF0" />
            <path d="M9 12l2 2 4-4" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    ),
    play: () => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
        </svg>
    ),
    lock: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ),
    users: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    dollar: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
};

// Featured posts mock data - OnlyFans feed style
const featuredPosts = [
    {
        id: '1',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '14 Jan 2026',
        text: "Storms can't stop adventure! @liztravels takes on the wild Stockholm archipelago in a packraft, chasing a secret island sauna and those unforgettable views you can only find in Sweden. 🇸🇪",
        links: ['onlyfans.com/liztravels', 'onlyfans.com/oftv'],
        media: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
        isVideo: false,
    },
    {
        id: '2',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '13 Jan 2026',
        text: "Behind the lens with @sophiabelle! Discover her creative process and exclusive content that keeps fans coming back for more. ✨",
        links: ['onlyfans.com/sophiabelle'],
        media: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
        isVideo: true,
    },
    {
        id: '3',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '12 Jan 2026',
        text: "Fitness meets fashion! @emmarose shares her morning workout routine and the motivation that keeps her going strong. 💪",
        links: ['onlyfans.com/emmarose'],
        media: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
        isVideo: false,
    },
    {
        id: '4',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '11 Jan 2026',
        text: "Living her best life! @isabellarose takes you on a journey through paradise. Subscribe to see more exclusive content 🌴",
        links: ['onlyfans.com/isabellarose'],
        media: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
        isVideo: false,
    },
    {
        id: '5',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '10 Jan 2026',
        text: "Art and beauty collide! @oliviajade showcases her latest photoshoot that's breaking the internet 📸",
        links: ['onlyfans.com/oliviajade'],
        media: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
        isVideo: false,
    },
    {
        id: '6',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '09 Jan 2026',
        text: "Weekend vibes with @mialuna! Join her exclusive community for behind-the-scenes content you won't find anywhere else 🔥",
        links: ['onlyfans.com/mialuna'],
        media: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800',
        isVideo: true,
    },
    {
        id: '7',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '08 Jan 2026',
        text: "Golden hour never looked so good! @charlottedavis shares her secret spots and exclusive moments 🌅",
        links: ['onlyfans.com/charlottedavis'],
        media: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
        isVideo: false,
    },
    {
        id: '8',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '07 Jan 2026',
        text: "Thank you for 500K subscribers! @ameliabrown celebrates this milestone with an exclusive giveaway 🎉",
        links: ['onlyfans.com/ameliabrown'],
        media: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
        isVideo: false,
    },
    {
        id: '9',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '06 Jan 2026',
        text: "Studio session with @avawilliams! Watch her creative process unfold in this exclusive video series 🎵",
        links: ['onlyfans.com/avawilliams'],
        media: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
        isVideo: true,
    },
    {
        id: '10',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '05 Jan 2026',
        text: "New year, new content! @miajohnson is kicking off 2026 with her most exclusive content yet 💕",
        links: ['onlyfans.com/miajohnson'],
        media: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800',
        isVideo: false,
    },
    {
        id: '11',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '04 Jan 2026',
        text: "Beach day with @ellathompson! Exclusive summer content dropping this weekend ☀️🏖️",
        links: ['onlyfans.com/ellathompson'],
        media: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
        isVideo: false,
    },
    {
        id: '12',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '03 Jan 2026',
        text: "Fashion forward! @gracemiller shows off her latest looks and styling tips for subscribers only 👗",
        links: ['onlyfans.com/gracemiller'],
        media: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
        isVideo: false,
    },
    {
        id: '13',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '02 Jan 2026',
        text: "Cooking with @zoedavis! Learn her secret recipes in this exclusive cooking series 🍳👩‍🍳",
        links: ['onlyfans.com/zoedavis'],
        media: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        isVideo: true,
    },
    {
        id: '14',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '01 Jan 2026',
        text: "Happy New Year from @lilywilson! Celebrate with exclusive content and special offers 🎆",
        links: ['onlyfans.com/lilywilson'],
        media: 'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=800',
        isVideo: false,
    },
    {
        id: '15',
        creator: { name: 'OnlyFans', username: '@onlyfans', avatar: '/logo.png', verified: true },
        timestamp: '31 Dec 2025',
        text: "Year in review with @hannahbrown! See the best moments from 2025 and what's coming next 🌟",
        links: ['onlyfans.com/hannahbrown'],
        media: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=800',
        isVideo: true,
    },
];

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [visiblePosts, setVisiblePosts] = useState(10);

    const POSTS_PER_PAGE = 5;
    const hasMorePosts = visiblePosts < featuredPosts.length;

    const handleShowMore = () => {
        setVisiblePosts(prev => Math.min(prev + POSTS_PER_PAGE, featuredPosts.length));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(email, password);
            router.push('/feed');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        console.log(`Login with ${provider}`);
    };

    return (
        <div className="signup-page">
            {/* Hero Section - Two Columns */}
            <section className="signup-hero">
                {/* Left Column - Landing/Branding */}
                <div className="landing-panel">
                    <div className="landing-content">
                        {/* Logo */}
                        <div className="landing-logo">
                            <img src="/logo.png" alt="Logo" />
                            <span className="landing-logo-text">OnlyFans</span>
                        </div>

                        {/* Headline */}
                        <h1 className="landing-headline">
                            The #1 platform for creators to connect with fans
                        </h1>

                        {/* Subheadline */}
                        <p className="landing-subheadline">
                            Join millions of creators and fans. Share exclusive content, build your community, and earn on your own terms.
                        </p>

                        {/* Features */}
                        <div className="landing-features">
                            <div className="landing-feature">
                                <div className="feature-icon">
                                    {Icons.lock()}
                                </div>
                                <span className="feature-text">
                                    Share exclusive content with your subscribers
                                </span>
                            </div>

                            <div className="landing-feature">
                                <div className="feature-icon">
                                    {Icons.users()}
                                </div>
                                <span className="feature-text">
                                    Build a loyal community of supporters
                                </span>
                            </div>

                            <div className="landing-feature">
                                <div className="feature-icon">
                                    {Icons.dollar()}
                                </div>
                                <span className="feature-text">
                                    Earn money doing what you love
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Login Panel */}
                <div className="signup-panel">
                    <div className="signup-panel-inner">
                        {/* Mobile Logo (visible only on mobile) */}
                        <div className="signup-mobile-logo">
                            <img src="/logo.png" alt="Logo" />
                        </div>

                        {/* Headline */}
                        <h2 className="signup-headline">Welcome back</h2>
                        <p className="signup-subheadline">
                            Log in to continue to your account
                        </p>

                        {/* Login Form */}
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
                                <label htmlFor="password">Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        className="form-input"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{ paddingRight: '48px' }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? Icons.eyeOff() : Icons.eye()}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="signup-button"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logging in...' : 'Log in'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="divider">
                            <div className="divider-line" />
                            <span className="divider-text">or</span>
                            <div className="divider-line" />
                        </div>

                        {/* Social Login Buttons */}
                        <div className="social-buttons">
                            <button
                                type="button"
                                className="social-button twitter"
                                onClick={() => handleSocialLogin('twitter')}
                            >
                                {Icons.twitter()}
                                <span>Continue with X</span>
                            </button>

                            <button
                                type="button"
                                className="social-button google"
                                onClick={() => handleSocialLogin('google')}
                            >
                                {Icons.google()}
                                <span>Continue with Google</span>
                            </button>

                            <button
                                type="button"
                                className="social-button apple"
                                onClick={() => handleSocialLogin('apple')}
                            >
                                {Icons.apple()}
                                <span>Continue with Apple</span>
                            </button>
                        </div>

                        {/* Secondary Links */}
                        <div className="secondary-links">
                            <Link href="/auth/signup" className="secondary-link">
                                Create account
                            </Link>
                            <Link href="/auth/forgot-password" className="secondary-link">
                                Forgot password?
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Creators Section */}
            <section className="featured-section">
                <div className="featured-container">
                    <h2 className="featured-title">Latest featured posts</h2>

                    <div className="featured-feed">
                        {featuredPosts.slice(0, visiblePosts).map((post) => {
                            // Function to render text with highlighted @mentions
                            const renderTextWithMentions = (text: string) => {
                                const parts = text.split(/(@\w+)/g);
                                return parts.map((part, index) => {
                                    if (part.startsWith('@')) {
                                        return <span key={index} className="mention">{part}</span>;
                                    }
                                    return part;
                                });
                            };

                            return (
                                <article key={post.id} className="featured-post">
                                    {/* Post Header */}
                                    <div className="featured-post-header">
                                        <img
                                            src={post.creator.avatar}
                                            alt={post.creator.name}
                                            className="featured-avatar"
                                        />
                                        <div className="featured-post-info">
                                            <div className="featured-creator-row">
                                                <span className="featured-creator-name">{post.creator.name}</span>
                                                {post.creator.verified && Icons.verified()}
                                            </div>
                                            <div className="featured-username">{post.creator.username}</div>
                                        </div>
                                        <div className="featured-timestamp">{post.timestamp}</div>
                                    </div>

                                    {/* Post Description */}
                                    <div className="featured-description">
                                        <p>{renderTextWithMentions(post.text)}</p>
                                        {post.links && post.links.length > 0 && (
                                            <div className="featured-links">
                                                {post.links.map((link, index) => (
                                                    <a key={index} href={`https://${link}`} className="featured-link">
                                                        {link}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Post Media */}
                                    <div className="featured-media">
                                        <img src={post.media} alt="Featured content" />
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* Show More Button */}
                    {hasMorePosts && (
                        <div className="show-more-container">
                            <button
                                className="show-more-button"
                                onClick={handleShowMore}
                            >
                                Show more
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
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

