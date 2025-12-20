import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from '../../context/HistoryContext';
import { useNavigate } from 'react-router-dom';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
// import './dashboard/dashboard.css';
import './profile.css';

const Profile = () => {
    const { user, role, logout } = useAuth();
    const { historyItems } = useHistory();
    const navigate = useNavigate();

    // Helper for Initials
    const getInitials = () => {
        if (user?.name) {
            const parts = user.name.split(' ');
            if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
            return parts[0].substring(0, 2).toUpperCase();
        }
        if (user?.email) {
            return user.email.substring(0, 2).toUpperCase();
        }
        return "G";
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Calculate Stats
    const emailCount = historyItems.filter(item => item.type === 'email').length;
    const posterCount = historyItems.filter(item => item.type === 'poster').length;
    const logoCount = historyItems.filter(item => item.type === 'logo').length;

    // Recent Activity (Top 3)
    const recentActivity = historyItems.slice(0, 3);

    return (


        <div className="dashboard-page">
            <main className="main" style={{ display: 'flex', flexDirection: 'column' }}>            
              <Header title="Profile" />
                {/* CONTENT AREA */}
                <div style={{ paddingBottom: '40px', width: '100%' }}>

                    <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
                        View your personal info, system stats & recent activity.
                    </p>

                    {/* PROFILE CARD */}
                    <section className="profile-card-container">
                        <div className="profile-avatar-large">
                            {getInitials()}
                        </div>

                        <h2 className="profile-name">
                            {user?.name || `Prof. ${user?.email?.split('@')[0]}`}
                        </h2>
                        <p className="profile-text">Email: {user?.email}</p>
                        <p className="profile-text">Department of Computer Science</p>
                        <p className="profile-text" style={{ marginBottom: '24px' }}>Joined: {user?.signupDate || "Dec 2, 2025"}</p>

                        <button className="edit-profile-btn" onClick={() => navigate('/settings')}>
                            Edit Profile
                        </button>

                        {/* Contact Info Inline */}
                        <div className="contact-info-row">
                            <div className="contact-item">📧 nimbus00agam@gmail.com</div>
                        </div>
                    </section>
                
                    {/* STATS SECTION */}
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F1724', marginBottom: '16px' }}>Your Stats</h3>
                    <section className="section-box stats-grid">
                        {/* Email Stat */}
                        <div className="stat-card stat-email">
                            <div className="stat-number">{emailCount}</div>
                            <div className="stat-label">Emails Generated</div>
                        </div>

                        {/* Poster Stat */}
                        <div className="stat-card stat-poster">
                            <div className="stat-number">{posterCount}</div>
                            <div className="stat-label">Posters Created</div>
                        </div>

                        {/* Logo Stat */}
                        <div className="stat-card stat-logo">
                            <div className="stat-number">{logoCount}</div>
                            <div className="stat-label">Logos Generated</div>
                        </div>
                    </section>

                    {/* RECENT ACTIVITY SECTION */}
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F1724', marginBottom: '16px' }}>Recent Activity</h3>
                    <section className="section-box recent-activity-container">
                        {recentActivity.length > 0 ? recentActivity.map((item) => (
                            <div key={item.id} className="recent-activity-item">
                                <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                                    {item.title}
                                </p>
                                <p style={{ fontSize: '12px', color: '#6B7280' }}>
                                    {item.date}
                                </p>
                            </div>
                        )) : <p style={{ color: '#6B7280' }}>No recent activity.</p>}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Profile;
