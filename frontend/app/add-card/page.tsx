'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuthGuard } from '../../utils/authGuard';
import Link from 'next/link';

// Country list for dropdown
const countries = [
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
];

// States for India
const indianStates = [
    'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Delhi', 'Gujarat',
    'Kerala', 'Telangana', 'West Bengal', 'Uttar Pradesh', 'Rajasthan'
];

// Icons
const Icons = {
    back: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    ),
    close: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    ),
    camera: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00aeef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
        </svg>
    ),
    wallet: () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
    ),
    chevronDown: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a96a3" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    )
};

export default function AddCardPage() {
    const { user, isLoading: authLoading } = useAuthGuard(true);

    // Form state
    const [formData, setFormData] = useState({
        country: 'IN',
        state: 'Tamil Nadu',
        address: '',
        city: 'Chennai',
        zipCode: '',
        email: user?.email || '',
        nameOnCard: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        ageConfirmed: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [walletBalance] = useState(0);
    const [transactions] = useState<any[]>([]);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.ageConfirmed) {
            alert('Please confirm you are at least 18 years old');
            return;
        }

        setIsSubmitting(true);
        try {
            // In a real app, this would send card data to a payment processor
            console.log('Card data submitted:', formData);
            alert('Card added successfully!');
        } catch (error) {
            console.error('Failed to add card:', error);
            alert('Failed to add card. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#fafafa' }}>
                <Navbar />
                <main style={{ marginLeft: '288px', padding: '24px' }}>
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <p style={{ color: '#8a96a3', fontSize: '16px' }}>Loading...</p>
                    </div>
                </main>
            </div>
        );
    }

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1a1a2e',
        outline: 'none',
        background: 'white'
    };

    const labelStyle = {
        position: 'absolute' as const,
        top: '-8px',
        left: '12px',
        background: 'white',
        padding: '0 4px',
        fontSize: '12px',
        color: '#8a96a3'
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fafafa' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', padding: '0 24px', gap: '24px' }}>
                <Navbar />
                <main style={{ flex: 1, maxWidth: '600px', paddingLeft: '24px' }}>
                {/* Main Content */}
                <div style={{ flex: 1, maxWidth: '640px', minWidth: '0' }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 0',
                        borderBottom: '1px solid #eaeaea'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Link href="/feed" style={{ color: '#1a1a2e', display: 'flex', alignItems: 'center' }}>
                                {Icons.back()}
                            </Link>
                            <h1 style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                color: '#1a1a2e',
                                margin: 0,
                                textTransform: 'uppercase'
                            }}>
                                ADD CARD
                            </h1>
                        </div>
                        <button style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#00aeef',
                            fontSize: '14px',
                            fontWeight: 600
                        }}>
                            VERIFY
                        </button>
                    </div>

                    {/* Close Button Banner */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '20px 0'
                    }}>
                        <button style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#666',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {Icons.close()}
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ background: 'white', padding: '24px', borderRadius: '0' }}>
                        {/* Billing Details Section */}
                        <h2 style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#1a1a2e',
                            marginBottom: '16px',
                            textTransform: 'uppercase'
                        }}>
                            BILLING DETAILS
                        </h2>

                        <p style={{
                            fontSize: '13px',
                            color: '#8a96a3',
                            marginBottom: '20px'
                        }}>
                            We are fully compliant with Payment Card Industry Data Security Standards.
                        </p>

                        {/* Country and State Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ position: 'relative' }}>
                                <label style={labelStyle}>Country</label>
                                <select
                                    value={formData.country}
                                    onChange={(e) => handleInputChange('country', e.target.value)}
                                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                                >
                                    {countries.map(c => (
                                        <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                                    ))}
                                </select>
                                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    {Icons.chevronDown()}
                                </div>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <label style={labelStyle}>State / Province</label>
                                <select
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                                >
                                    {indianStates.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    {Icons.chevronDown()}
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <input
                                type="text"
                                placeholder="Address"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        {/* City and ZIP Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ position: 'relative' }}>
                                <label style={labelStyle}>City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="ZIP / Postal Code"
                                    value={formData.zipCode}
                                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Card Details Section */}
                        <h2 style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#1a1a2e',
                            marginBottom: '16px',
                            textTransform: 'uppercase'
                        }}>
                            CARD DETAILS
                        </h2>

                        {/* Email and Name Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ position: 'relative' }}>
                                <label style={labelStyle}>E-mail</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Name on the card"
                                    value={formData.nameOnCard}
                                    onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Card Number */}
                        <div style={{ position: 'relative', marginBottom: '8px' }}>
                            <input
                                type="text"
                                placeholder="Card Number"
                                value={formData.cardNumber}
                                onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
                                style={inputStyle}
                            />
                            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                                {Icons.camera()}
                            </div>
                        </div>
                        <button
                            type="button"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#00aeef',
                                fontSize: '13px',
                                cursor: 'pointer',
                                marginBottom: '16px',
                                padding: 0
                            }}
                        >
                            My card number is longer
                        </button>

                        {/* Expiry and CVC Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ position: 'relative' }}>
                                <label style={labelStyle}>Expiration</label>
                                <input
                                    type="text"
                                    placeholder="MM / YY"
                                    value={formData.expiryMonth}
                                    onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="CVC"
                                    value={formData.cvc}
                                    onChange={(e) => handleInputChange('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Age Confirmation */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px' }}>
                            <input
                                type="checkbox"
                                id="ageConfirm"
                                checked={formData.ageConfirmed}
                                onChange={(e) => handleInputChange('ageConfirmed', e.target.checked)}
                                style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="ageConfirm" style={{ fontSize: '14px', color: '#1a1a2e', cursor: 'pointer' }}>
                                Tick here to confirm that you are at least 18 years old and the age of majority in your place of residence
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    padding: '12px 32px',
                                    borderRadius: '25px',
                                    border: 'none',
                                    background: '#00aeef',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    opacity: isSubmitting ? 0.7 : 1
                                }}
                            >
                                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                            </button>
                        </div>

                        {/* Card Logos */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/100px-Visa_Inc._logo.svg.png" alt="Visa" style={{ height: '24px' }} />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/100px-Mastercard-logo.svg.png" alt="Mastercard" style={{ height: '24px' }} />
                        </div>

                        {/* Footer Text */}
                        <p style={{ fontSize: '11px', color: '#8a96a3', textAlign: 'center', lineHeight: '1.5' }}>
                            Fenix International Limited, 9th Floor, 107 Cheapside, London, EC2V 6DN<br />
                            Fenix Internet LLC, 1000 N West Street, Suite 1200, Wilmington, Delaware, 19801 USA
                        </p>
                    </form>
                </div>

                {/* Right Sidebar */}
                <div style={{ width: '320px', flexShrink: 0, paddingTop: '20px' }}>
                    {/* Wallet Balance */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #eaeaea',
                        marginBottom: '16px'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>
                            ${walletBalance}
                        </div>
                        <div style={{ fontSize: '14px', color: '#8a96a3' }}>
                            Wallet credits
                        </div>
                    </div>

                    {/* Add Funds Section */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #eaeaea',
                        marginBottom: '16px'
                    }}>
                        <h3 style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#8a96a3',
                            marginBottom: '16px',
                            textTransform: 'uppercase'
                        }}>
                            ADD FUNDS TO YOUR WALLET
                        </h3>
                        <button style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '25px',
                            border: 'none',
                            background: '#00aeef',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginBottom: '16px'
                        }}>
                            ADD A PAYMENT CARD
                        </button>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#1a1a2e' }}>
                                Make wallet primary method for rebills
                            </span>
                            <label style={{
                                position: 'relative',
                                display: 'inline-block',
                                width: '44px',
                                height: '24px'
                            }}>
                                <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                                <span style={{
                                    position: 'absolute',
                                    cursor: 'pointer',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: '#ddd',
                                    borderRadius: '12px',
                                    transition: '0.3s'
                                }} />
                            </label>
                        </div>
                    </div>

                    {/* Latest Transactions */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #eaeaea'
                    }}>
                        <h3 style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#8a96a3',
                            marginBottom: '16px',
                            textTransform: 'uppercase'
                        }}>
                            LATEST TRANSACTIONS
                        </h3>
                        {transactions.length === 0 ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '24px',
                                textAlign: 'center'
                            }}>
                                {Icons.wallet()}
                                <p style={{
                                    color: '#8a96a3',
                                    fontSize: '14px',
                                    marginTop: '8px'
                                }}>
                                    No Payments done yet.
                                </p>
                            </div>
                        ) : (
                            <div>
                                {transactions.map((tx: any) => (
                                    <div key={tx.id} style={{ padding: '12px 0', borderBottom: '1px solid #eaeaea' }}>
                                        {tx.description}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                </main>
            </div>
        </div>
    );
}

