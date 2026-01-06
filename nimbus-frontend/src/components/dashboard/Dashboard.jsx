import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './dashboard.css';
import RecentActivity from '../common/RecentActivity';
import '../tools/history/activity.css';

const Dashboard = () => {
  const { user, role } = useAuth();

  // Quick actions with descriptions for Bento grid
  const quickActions = [
    {
      id: 1,
      name: 'Email Generator',
      icon: '📧',
      path: '/email-generator',
      description: 'Draft professional emails in seconds'
    },
    {
      id: 2,
      name: 'Poster Generator',
      icon: '🎨',
      path: '/poster-generator',
      description: 'Create eye-catching event posters'
    },
    {
      id: 3,
      name: 'Logo Generator',
      icon: '🎯',
      path: '/logo-generator',
      description: 'Generate creative logo concepts'
    },
    {
      id: 4,
      name: 'Report Generator',
      icon: '📊',
      path: '/report-generator',
      description: 'Draft professional departmental reports'
    },
  ];

  return (
    <div className="dashboard-page">
      <main className="main-content">
        <div className="dashboard-content-area">
          {/* Welcome Section */}
          <section className="welcome-section">
            <h1 className="welcome-title">Welcome , <span className="welcome-name">{user?.name?.split(' ')[0] || 'User'}</span>! 👋</h1>
            <p className="welcome-subtitle">Your personalized {role || 'workspace'} companion for academic excellence.</p>
          </section>

          <div className="dashboard-main-grid">
            {/* Left Side: Quick Actions (2x2 grid) */}
            <div className="dashboard-left-col">
              <section className="quick-actions-section">
                <div className="section-header">
                  <h2 className="section-title">Quick Tools</h2>
                </div>
                <div className="quick-actions-grid">
                  {quickActions.map((action) => (
                    <Link
                      key={action.id}
                      to={action.path}
                      className="quick-action-card"
                    >
                      <div className="action-icon">{action.icon}</div>
                      <div className="action-info">
                        <div className="action-name">{action.name}</div>
                        <div className="action-desc">{action.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Side: Recent Activity */}
            <div className="dashboard-right-col">
              <RecentActivity limit={4} showViewAll={true} title="Recent Activity" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
