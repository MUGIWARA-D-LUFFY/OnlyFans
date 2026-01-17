'use client';

import { useRouter } from 'next/navigation';

export default function TermsPage() {
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
        
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '20px' }}>Terms of Service</h1>
        
        <div style={{ lineHeight: '1.8', color: '#333' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>
            2. Age Requirement
          </h2>
          <p>
            You must be at least 18 years of age to use this platform. By using this service, you represent and warrant that you are of legal age.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>
            3. Content Guidelines
          </h2>
          <p>
            Users are responsible for the content they post. Content must comply with all applicable laws and regulations.
            Prohibited content includes but is not limited to: illegal content, harassment, hate speech, and spam.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>
            4. Payment Terms
          </h2>
          <p>
            Subscription fees are charged on a recurring basis. Creators receive payments according to the platform's payment schedule.
            All transactions are subject to applicable fees and taxes.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>
            5. Account Termination
          </h2>
          <p>
            We reserve the right to terminate or suspend accounts that violate these terms of service.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>
            6. Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of any changes.
          </p>

          <p style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
            Last updated: January 18, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
