'use client';

import React, { useState } from 'react';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';

// Helper to convert Google Drive URLs to embeddable format
const getEmbedUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=s200`;
    }
  }
  return url;
};

// SVG Icons matching the reference design
const Icons = {
  home: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  notifications: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  ),
  messages: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  collections: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  subscriptions: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  addCard: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
      <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
  ),
  profile: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="10" r="3"></circle>
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
    </svg>
  ),
  more: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="8" cy="12" r="1" fill={color}></circle>
      <circle cx="12" cy="12" r="1" fill={color}></circle>
      <circle cx="16" cy="12" r="1" fill={color}></circle>
    </svg>
  ),
  settings: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  creator: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  ),
  help: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  darkMode: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  ),
  globe: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  ),
  logout: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  ),
  close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  chevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    router.push('/');
  };

  const NavLink = ({ href, icon, children }: { href: string; icon: (color: string) => React.ReactNode; children: React.ReactNode }) => {
    const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
    const activeColor = '#1a1a2e';
    const defaultColor = '#8a96a3';

    return (
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '14px 12px',
          textDecoration: 'none',
          fontSize: '15px',
          fontWeight: isActive ? 600 : 400,
          color: isActive ? activeColor : '#8a96a3',
          background: 'transparent',
          borderRadius: '8px',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = '#f5f5f5';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
          {icon(isActive ? activeColor : defaultColor)}
        </span>
        <span>{children}</span>
      </Link>
    );
  };

  // Menu item component for dropdown
  const MenuItem = ({ icon, children, href, onClick, subtitle }: {
    icon: (color: string) => React.ReactNode;
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    subtitle?: string;
  }) => {
    const content = (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '14px 20px',
          cursor: 'pointer',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        onClick={onClick}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
          {icon('#1a1a2e')}
        </span>
        <span style={{ fontSize: '15px', color: '#1a1a2e' }}>
          {children}
          {subtitle && <span style={{ color: '#8a96a3', marginLeft: '4px' }}>{subtitle}</span>}
        </span>
      </div>
    );

    if (href) {
      return (
        <Link href={href} style={{ textDecoration: 'none' }} onClick={() => setShowProfileMenu(false)}>
          {content}
        </Link>
      );
    }
    return content;
  };

  if (!isAuthenticated) {
    return (
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '16px 32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none'
          }}>
            <img src="/logo.png" alt="Logo" style={{ height: '36px', width: 'auto' }} />
          </Link>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link
              href="/auth/login"
              style={{
                padding: '10px 24px',
                borderRadius: '25px',
                border: '1px solid #e0e0e0',
                background: 'white',
                color: '#262626',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              style={{
                padding: '10px 24px',
                borderRadius: '25px',
                border: 'none',
                background: '#00aeef',
                color: 'white',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav style={{
        width: '240px',
        background: 'white',
        borderRight: '1px solid #eaeaea',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px',
        height: '100vh',
        position: 'sticky',
        top: 0
      }}>
        {/* Logo at Top - Shows Avatar or MS */}
        <Link href="/feed" style={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          marginBottom: '32px',
          paddingLeft: '12px'
        }}>
          {user?.avatarUrl ? (
            <img
              src={getEmbedUrl(user.avatarUrl)}
              alt="Brand"
              referrerPolicy="no-referrer"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #00aeef'
              }}
            />
          ) : (
            <div style={{
              color: '#00aeef',
              fontWeight: 'bold',
              fontSize: '18px',
              letterSpacing: '1px'
            }}>
              MS
            </div>
          )}
        </Link>

        {/* Navigation Links */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0'
        }}>
          <NavLink href="/feed" icon={Icons.home}>Home</NavLink>
          <NavLink href="/notifications" icon={Icons.notifications}>Notifications</NavLink>
          <NavLink href="/messages" icon={Icons.messages}>Messages</NavLink>
          <NavLink href="/collections" icon={Icons.collections}>Collections</NavLink>
          <NavLink href="/subscriptions" icon={Icons.subscriptions}>Subscriptions</NavLink>
          <NavLink href="/add-card" icon={Icons.addCard}>Add card</NavLink>



          {/* My Profile - show Avatar if available */}
          <NavLink
            href="/my-profile"
            icon={(color) =>
              user?.avatarUrl ? (
                <img
                  src={getEmbedUrl(user.avatarUrl)}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: pathname === '/my-profile' ? '2px solid #1a1a2e' : 'none'
                  }}
                />
              ) : (
                Icons.profile(color)
              )
            }
          >
            My profile
          </NavLink>


          {/* More - opens same menu */}
          <div
            onClick={() => setShowProfileMenu(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px 12px',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 400,
              color: '#8a96a3',
              background: 'transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
              {Icons.more('#8a96a3')}
            </span>
            <span>More</span>
          </div>
        </div>

        {/* New Post Button */}
        <div style={{ padding: '0 8px', marginTop: 'auto' }}>
          <Link
            href={user?.role === 'CREATOR' ? '/creator/upload' : '/become-creator'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: '50px',
              background: '#00aeef',
              color: 'white',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0099d6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#00aeef';
            }}
          >
            {Icons.plus()}
            <span>New Post</span>
          </Link>
        </div>
      </nav>

      {/* Profile Menu Overlay */}
      {showProfileMenu && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowProfileMenu(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 2000
            }}
          />

          {/* Menu Modal */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '340px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            zIndex: 2001,
            overflow: 'hidden'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowProfileMenu(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              {Icons.close()}
            </button>

            {/* User Info Header */}
            <div style={{ padding: '24px 20px', borderBottom: '1px solid #eaeaea' }}>
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#ff4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '24px'
                  }}>
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {/* Online indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '2px solid white'
                  }} />
                </div>
              </div>

              {/* Name with dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                  {user?.username || 'User'}
                </h3>
                {Icons.chevronDown()}
              </div>
              <p style={{ fontSize: '14px', color: '#8a96a3', margin: 0, marginBottom: '12px' }}>
                @{user?.username || 'user'}
              </p>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                <span><strong style={{ color: '#1a1a2e' }}>0</strong> <span style={{ color: '#8a96a3' }}>Fans</span></span>
                <span>·</span>
                <span><strong style={{ color: '#1a1a2e' }}>0</strong> <span style={{ color: '#8a96a3' }}>Following</span></span>
              </div>
            </div>

            {/* Menu Items - Group 1 */}
            <div style={{ borderBottom: '1px solid #eaeaea' }}>
              <MenuItem icon={Icons.profile} href="/my-profile">My profile</MenuItem>
              <MenuItem icon={Icons.collections} href="/collections">Collections</MenuItem>
              <MenuItem icon={Icons.settings} href="/settings">Settings</MenuItem>
            </div>

            {/* Menu Items - Group 2 */}
            <div style={{ borderBottom: '1px solid #eaeaea' }}>
              <MenuItem icon={Icons.addCard} href="/add-card" subtitle="(to subscribe)">Your cards</MenuItem>
              {user?.role === 'CREATOR' ? (
                <MenuItem icon={Icons.creator} href="/creator/dashboard">Dashboard</MenuItem>
              ) : (
                <MenuItem icon={Icons.creator} href="/become-creator" subtitle="(to earn)">Become a creator</MenuItem>
              )}
            </div>


            {/* Menu Items - Group 3 */}
            <div>
              <MenuItem icon={Icons.help} href="/help">Help and support</MenuItem>
              <MenuItem icon={Icons.darkMode} onClick={() => alert('Dark mode coming soon!')}>Dark mode</MenuItem>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
                    {Icons.globe('#1a1a2e')}
                  </span>
                  <span style={{ fontSize: '15px', color: '#1a1a2e' }}>English</span>
                </div>
                {Icons.chevronDown()}
              </div>
              <MenuItem icon={Icons.logout} onClick={handleLogout}>Log out</MenuItem>
            </div>
          </div>
        </>
      )}
    </>
  );
}
