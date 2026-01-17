'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuthGuard } from '../../utils/authGuard';
import { useUserStore } from '../../store/user.store';
import { useRouter } from 'next/navigation';
import api from '../../services/api';

// Icons
const Icons = {
  back: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  camera: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  ),
  check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
};

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthGuard(true);
  const { profile, fetchProfile, updateProfile } = useUserStore();

  // Form state
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [likesNotifications, setLikesNotifications] = useState(true);
  const [commentsNotifications, setCommentsNotifications] = useState(true);

  // UI state
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setEmail(profile.email || '');
      setAvatarUrl(profile.avatarUrl || '');
    }
  }, [profile]);

  const showMessage = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile({ username, bio, avatarUrl });
      await fetchProfile();
      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showMessage('error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showMessage('error', 'Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('success', 'Password changed successfully!');
    } catch (error: any) {
      console.error('Failed to change password:', error);
      showMessage('error', error.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put('/users/notifications', {
        emailNotifications,
        pushNotifications,
        messageNotifications,
        likesNotifications,
        commentsNotifications
      });
      showMessage('success', 'Notification preferences saved!');
    } catch (error) {
      console.error('Failed to save notifications:', error);
      showMessage('error', 'Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== 'DELETE') {
      showMessage('error', 'Account deletion cancelled.');
      return;
    }

    try {
      await api.delete('/users/me');
      router.push('/auth/signin');
    } catch (error) {
      console.error('Failed to delete account:', error);
      showMessage('error', 'Failed to delete account. Please try again.');
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile Settings' },
    { id: 'password', label: 'Change Password' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy & Security' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', padding: '0 24px', gap: '24px' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', padding: '0' }}>
        {/* Left Sidebar - Navigation */}
        <div style={{
          width: '280px',
          borderRight: '1px solid #eaeaea',
          background: 'white',
          minHeight: '100vh',
          padding: '20px 0'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '0 20px 20px',
            borderBottom: '1px solid #eaeaea'
          }}>
            <button
              onClick={() => router.back()}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
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
              Settings
            </h1>
          </div>

          {/* Navigation Items */}
          <div style={{ padding: '16px 0' }}>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '14px 20px',
                  border: 'none',
                  background: activeSection === section.id ? '#f0f8ff' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeSection === section.id ? 600 : 400,
                  color: activeSection === section.id ? '#00aeef' : '#1a1a2e',
                  borderLeft: activeSection === section.id ? '3px solid #00aeef' : '3px solid transparent'
                }}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '24px', maxWidth: '600px' }}>
          {/* Status Messages */}
          {successMessage && (
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
              {Icons.check()} {successMessage}
            </div>
          )}
          {errorMessage && (
            <div style={{
              padding: '12px 16px',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {errorMessage}
            </div>
          )}

          {/* Profile Settings */}
          {activeSection === 'profile' && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px', color: '#1a1a2e' }}>
                Profile Settings
              </h2>
              <form onSubmit={handleProfileSubmit}>
                {/* Avatar */}
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                  <div style={{
                    position: 'relative',
                    display: 'inline-block'
                  }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: avatarUrl
                        ? `url(${avatarUrl}) center/cover`
                        : '#00aeef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '32px',
                      fontWeight: 'bold'
                    }}>
                      {!avatarUrl && username?.[0]?.toUpperCase()}
                    </div>
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#00aeef',
                        border: '2px solid white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}
                    >
                      {Icons.camera()}
                    </button>
                  </div>
                </div>

                {/* Avatar URL */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #eaeaea',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Username */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #eaeaea',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
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
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell people about yourself..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #eaeaea',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Email (Read-only) */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #eaeaea',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: '#f5f5f5',
                      color: '#666'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#8a96a3', marginTop: '4px' }}>
                    Contact support to change your email address
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '25px',
                    border: 'none',
                    background: '#00aeef',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: isLoading ? 'wait' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Password Settings */}
          {activeSection === 'password' && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px', color: '#1a1a2e' }}>
                Change Password
              </h2>
              <form onSubmit={handlePasswordSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #eaeaea',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #eaeaea',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
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
                    background: '#00aeef',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: isLoading ? 'wait' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px', color: '#1a1a2e' }}>
                Notification Preferences
              </h2>
              <form onSubmit={handleNotificationSubmit}>
                {[
                  { label: 'Email Notifications', state: emailNotifications, setter: setEmailNotifications },
                  { label: 'Push Notifications', state: pushNotifications, setter: setPushNotifications },
                  { label: 'Message Notifications', state: messageNotifications, setter: setMessageNotifications },
                  { label: 'Likes Notifications', state: likesNotifications, setter: setLikesNotifications },
                  { label: 'Comments Notifications', state: commentsNotifications, setter: setCommentsNotifications }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: '1px solid #eaeaea'
                  }}>
                    <span style={{ fontSize: '14px', color: '#1a1a2e' }}>{item.label}</span>
                    <button
                      type="button"
                      onClick={() => item.setter(!item.state)}
                      style={{
                        width: '48px',
                        height: '28px',
                        borderRadius: '14px',
                        border: 'none',
                        background: item.state ? '#00aeef' : '#ddd',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.2s'
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        top: '2px',
                        left: item.state ? '22px' : '2px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'white',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </button>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '25px',
                    border: 'none',
                    background: '#00aeef',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: isLoading ? 'wait' : 'pointer',
                    marginTop: '24px',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </button>
              </form>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px', color: '#1a1a2e' }}>
                Privacy & Security
              </h2>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px' }}>
                  Download Your Data
                </h3>
                <p style={{ fontSize: '13px', color: '#8a96a3', marginBottom: '12px' }}>
                  Request a copy of all your data including posts, messages, and account information.
                </p>
                <button
                  style={{
                    padding: '10px 20px',
                    borderRadius: '25px',
                    border: '1px solid #00aeef',
                    background: 'white',
                    color: '#00aeef',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Request Data Export
                </button>
              </div>

              <div style={{
                borderTop: '1px solid #eaeaea',
                paddingTop: '24px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#dc2626', marginBottom: '8px' }}>
                  Danger Zone
                </h3>
                <p style={{ fontSize: '13px', color: '#8a96a3', marginBottom: '12px' }}>
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '25px',
                    border: '1px solid #dc2626',
                    background: 'white',
                    color: '#dc2626',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

