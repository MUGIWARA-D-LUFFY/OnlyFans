'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useAuthGuard } from '../../utils/authGuard';
import api from '../../services/api';

const Icons = {
    back: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    ),
    star: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    ),
    check: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    ),
};

export default function BecomeCreatorPage() {
    const router = useRouter();
    const isAuthenticated = useAuthGuard();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        subscriptionPrice: '',
        category: '',
    });

    if (!isAuthenticated) {
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                displayName: formData.displayName,
                bio: formData.bio,
                subscriptionPrice: parseFloat(formData.subscriptionPrice),
                category: formData.category,
            };

            await api.post('/creators', payload);
            setSuccess(true);
            
            setTimeout(() => {
                router.push('/creator/dashboard');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create creator profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fafafa' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', padding: '0 24px', gap: '24px' }}>
                <Navbar />
                <div style={{ flex: 1, maxWidth: '600px', paddingLeft: '24px' }}>
            <div style={{ 
                maxWidth: '800px', 
                margin: '0 auto', 
                padding: '24px 24px 24px 0'
            }}>
                {/* Header */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '24px',
                    gap: '12px'
                }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#1a1a2e'
                        }}
                    >
                        {Icons.back()}
                    </button>
                    <h1 style={{ 
                        fontSize: '18px', 
                        fontWeight: 700, 
                        color: '#1a1a2e',
                        margin: 0,
                        textTransform: 'uppercase'
                    }}>
                        Become a Creator
                    </h1>
                </div>

                {/* Success Message */}
                {success && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#d1fae5',
                        color: '#059669',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        {Icons.check()} Creator profile created successfully! Redirecting to dashboard...
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                )}

                {/* Info Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
                        <div style={{ color: '#00aeef' }}>
                            {Icons.star()}
                        </div>
                        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
                            Why become a creator?
                        </h2>
                    </div>
                    <ul style={{ 
                        color: '#6b7280', 
                        lineHeight: '1.8', 
                        paddingLeft: '20px',
                        margin: 0,
                        fontSize: '14px'
                    }}>
                        <li>Monetize your content with monthly subscriptions</li>
                        <li>Connect directly with your fans</li>
                        <li>Share exclusive content with your subscribers</li>
                        <li>Build your personal brand</li>
                        <li>Earn money doing what you love</li>
                    </ul>
                </div>

                {/* Form */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px', color: '#1a1a2e' }}>
                        Creator Profile
                    </h2>
                    
                    <form onSubmit={handleSubmit}>
                        {/* Display Name */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '14px',
                                fontWeight: 500,
                                marginBottom: '8px',
                                color: '#1a1a2e'
                            }}>
                                Display Name *
                            </label>
                            <input
                                type="text"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleInputChange}
                                required
                                placeholder="Your creator name"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #eaeaea',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#00aeef'}
                                onBlur={(e) => e.target.style.borderColor = '#eaeaea'}
                            />
                        </div>

                        {/* Bio */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '14px',
                                fontWeight: 500,
                                marginBottom: '8px',
                                color: '#1a1a2e'
                            }}>
                                Bio *
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                required
                                placeholder="Tell your audience about yourself..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #eaeaea',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#00aeef'}
                                onBlur={(e) => e.target.style.borderColor = '#eaeaea'}
                            />
                        </div>

                        {/* Category */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '14px',
                                fontWeight: 500,
                                marginBottom: '8px',
                                color: '#1a1a2e'
                            }}>
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #eaeaea',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box',
                                    background: 'white'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#00aeef'}
                                onBlur={(e) => e.target.style.borderColor = '#eaeaea'}
                            >
                                <option value="" disabled>Select a category</option>
                                <option value="Fitness">Fitness</option>
                                <option value="Fashion">Fashion</option>
                                <option value="Art">Art</option>
                                <option value="Music">Music</option>
                                <option value="Gaming">Gaming</option>
                                <option value="Lifestyle">Lifestyle</option>
                                <option value="Adult">Adult</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Subscription Price */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '14px',
                                fontWeight: 500,
                                marginBottom: '8px',
                                color: '#1a1a2e'
                            }}>
                                Monthly Subscription Price ($) *
                            </label>
                            <input
                                type="number"
                                name="subscriptionPrice"
                                value={formData.subscriptionPrice}
                                onChange={handleInputChange}
                                required
                                min="1"
                                step="0.01"
                                placeholder="9.99"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #eaeaea',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#00aeef'}
                                onBlur={(e) => e.target.style.borderColor = '#eaeaea'}
                            />
                            <p style={{ 
                                color: '#6b7280', 
                                fontSize: '12px', 
                                marginTop: '6px',
                                marginBottom: 0
                            }}>
                                This is how much subscribers will pay per month to access your content
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || success}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '25px',
                                border: 'none',
                                background: loading || success ? '#80d7f7' : '#00aeef',
                                color: 'white',
                                fontSize: '15px',
                                fontWeight: 600,
                                cursor: loading || success ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s ease-in-out'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading && !success) {
                                    e.currentTarget.style.background = '#0099d6';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading && !success) {
                                    e.currentTarget.style.background = '#00aeef';
                                }
                            }}
                        >
                            {loading ? 'Creating Profile...' : success ? 'Profile Created!' : 'Create Creator Profile'}
                        </button>
                    </form>
                </div>

                {/* Terms Notice */}
                <p style={{ 
                    textAlign: 'center', 
                    color: '#6b7280', 
                    fontSize: '13px',
                    marginTop: '20px',
                    lineHeight: '1.6'
                }}>
                    By creating a creator profile, you agree to our Terms of Service and Creator Agreement
                </p>
            </div>
                </div>
            </div>
        </div>
    );
}

