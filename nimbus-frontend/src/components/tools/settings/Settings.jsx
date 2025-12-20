import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { toast } from '../../../utils/toast';
import Sidebar from '../../common/Sidebar';
import Header from '../../common/Header';
import '../../dashboard/dashboard.css'; // Common layout
import './settings.css'; // Specific styles

const Settings = () => {
  const { user, role, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.name || '');

  // Update local state if user context updates (e.g. initial load)
  useEffect(() => {
    if (user?.name) {
      setFullName(user.name);
    }
  }, [user]);

  const handleUpdateInfo = () => {
    updateUserProfile({ name: fullName });
    toast.success("Profile information updated successfully!");
  };

  // Helper for Initials
  const getInitials = () => {
    const parts = user.name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
    return "G";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <Header title="Settings" />

      <main className="main" style={{ display: 'flex', flexDirection: 'column' }}>


        {/* CONTENT */}
        <div className="settings-container">

          {/* PROFILE HEADING */}
          <h3 className="settings-header" style={{ marginTop: 0 }}>Profile</h3>

          {/* PROFILE CARD */}
          <section className="settings-profile-card">
            <div className="settings-avatar">
              {getInitials()}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '16px', color: '#0F1724', marginBottom: '4px' }}>
                {user?.name || `Prof. ${user?.email?.split('@')[0]}`}
              </h4>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '2px' }}>{user?.email}</p>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>Department of Computer Science</p>

              {/* <button className="change-photo-btn">Change Photo</button> */}
            </div>
          </section>

          {/* ACCOUNT SETTINGS */}
          <h3 className="settings-header">Account Settings</h3>
          <section className="settings-section-card">
            <div className="settings-form-grid">

              {/* Full Name */}
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Role */}
              <div>
                <label className="form-label">Role Assigned</label>
                <input type="text" className="form-input disabled" value={`${role} (Fixed by Admin)`} disabled />
              </div>

              {/* Email */}
              <div>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input disabled" value={user?.email} disabled />
              </div>

              {/* Update Button (Right aligned using grid placement or wrapper) */}
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button className="update-btn" onClick={handleUpdateInfo}>Update Info</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;