import { useState } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../contexts/AuthContext';
import '../shared/ManagementPage.css';
import './StudentPages.css';

export default function StudentSettings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    middleInitial: user?.middleInitial || '',
    lastName: user?.lastName || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/users/${user?.userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          middleInitial: formData.middleInitial || null,
          lastName: formData.lastName
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch(`/api/users/${user?.userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }

      setMessage('Password changed successfully!');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <StudentLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage your account preferences</p>
          </div>
        </div>

        {message && <div className="success-banner">{message}</div>}
        {error && <div className="error-banner">{error}</div>}

        <div className="settings-container">
          <div className="settings-card">
            <h2 className="settings-title">Profile Information</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.username}
                    disabled
                  />
                  <p className="form-hint">Username cannot be changed</p>
                </div>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Middle Initial</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.middleInitial}
                    onChange={(e) => setFormData({ ...formData, middleInitial: e.target.value })}
                    maxLength={1}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary">Update Profile</button>
            </form>
          </div>

          <div className="settings-card">
            <h2 className="settings-title">Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">Change Password</button>
            </form>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
