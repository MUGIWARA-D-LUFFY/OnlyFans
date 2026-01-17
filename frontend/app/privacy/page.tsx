'use client';

import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px' }}>
        <button
          onClick={() => router.back()}
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            border: '1px solid #eaeaea',
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '20px' }}>Privacy Policy</h1>
        
        <div style={{ lineHeight: '1.8', color: '#333' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us, including when you create an account, post content,
            make purchases, or communicate with other users.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>
            2. How We Use Your Information
          </h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, process transactions,
            send you technical notices and support messages, and communicate with you about products, services, and events.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>
            3. Information Sharing
          </h2>
          <p>
            We do not share your personal information with third parties except as described in this policy.
            We may share information with service providers who perform services on our behalf.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>
            4. Data Security
          </h2>
          <p>
            We take reasonable measures to help protect your personal information from loss, theft, misuse,
            unauthorized access, disclosure, alteration, and destruction.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>
            5. Your Rights
          </h2>
          <p>
            You have the right to access, update, or delete your personal information. You may also have the right
            to restrict or object to certain processing of your data.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>
            6. Cookies
          </h2>
          <p>
            We use cookies and similar tracking technologies to collect and track information about your use of our services.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>
            7. Changes to This Policy
          </h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by posting
            the new privacy policy on this page.
          </p>

          <p style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
            Last updated: January 18, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
