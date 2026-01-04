import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from '../../context/HistoryContext';
import RecentActivity from '../common/RecentActivity';
import './profile.css';

const Profile = () => {
    const { user, role } = useAuth();
    const { historyItems, loading } = useHistory();

    const getInitials = () => {
        if (!user || !user.name) return "U";
        const parts = user.name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0].substring(0, 2).toUpperCase();
    };

    const formatDate = (dateString) => {
        if (!dateString) return "December 2025";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const emailCount = historyItems.filter(item => item.type === 'email').length;
    const posterCount = historyItems.filter(item => item.type === 'poster').length;
    const logoCount = historyItems.filter(item => item.type === 'logo').length;
    const reportCount = historyItems.filter(item => item.type === 'report').length;

    return (
        <div className="dashboard-page">
            <main className="main-content">
                <div className="profile-content-area">

                    {/* HERO SECTION */}
                    <section className="profile-hero">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar-large">
                                {getInitials()}
                            </div>
                        </div>

                        <div className="profile-info-main">
                            <div className="profile-badge">{role || 'Pro Member'}</div>
                            <h1 className="profile-name-title">
                                {user?.name || `Explorer`}
                            </h1>
                            <p className="profile-email-sub">
                                📧 {user?.email}
                            </p>

                            <div className="profile-details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Member Since</span>
                                    <span className="detail-value">{formatDate(user?.signupDate || user?.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* STATS BENTO GRID */}
                    <div className="section-header">
                        <h2 className="section-title">Generation Insights</h2>
                    </div>

                    <section className="stats-summary">
                        <div className="stat-summary-item highlight">
                            <span className="stat-label">Total</span>
                            <span className="stat-value">{loading ? '...' : (emailCount + posterCount + logoCount + reportCount)}</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-summary-item">
                            <span className="stat-label">Emails</span>
                            <span className="stat-value small">{loading ? '...' : emailCount}</span>
                        </div>
                        <div className="stat-summary-item">
                            <span className="stat-label">Posters</span>
                            <span className="stat-value small">{loading ? '...' : posterCount}</span>
                        </div>
                        <div className="stat-summary-item">
                            <span className="stat-label">Logos</span>
                            <span className="stat-value small">{loading ? '...' : logoCount}</span>
                        </div>
                        <div className="stat-summary-item">
                            <span className="stat-label">Reports</span>
                            <span className="stat-value small">{loading ? '...' : reportCount}</span>
                        </div>
                    </section>

                    {/* RECENT ACTIVITY */}
                    <div className="profile-activity-section">
                        <RecentActivity limit={5} showViewAll={true} title="Activity Portfolio" />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
