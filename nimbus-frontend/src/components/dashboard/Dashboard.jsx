import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../common/Header'; // Import Header
import Sidebar from '../common/Sidebar';
import { useHistory } from '../../context/HistoryContext'; // Import HistoryContext
import './dashboard.css';
import { toast } from '../../utils/toast';

const Dashboard = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { historyItems, deleteActivity } = useHistory();

  // Get top 3 recent activities
  const recentActivities = historyItems.slice(0, 3);

  const handleDelete = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteActivity(item.id);
      toast.success("Item deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete item");
    }
  };

  const handleAction = (item) => {
    if (item.type === 'email') {
      navigate('/email-draft', { state: { emailData: item } });
    } else {
      toast.info(`${item.action} for ${item.type} coming soon`);
    }
  };

  // Quick actions
  const quickActions = [
    { id: 1, name: 'Email Draft', icon: '📧', path: '/email-draft' },
    { id: 2, name: 'Create Poster', icon: '🎨', path: '/poster-generator' },
    { id: 3, name: 'Logo Ideas', icon: '🎯', path: '/logo-ideas' },
  ];

  return (
    <div className="dashboard-page">
      {/* SIDEBAR handled by Layout, but if used standalone: */}
      {/* <Sidebar activePage="dashboard" /> */}

      {/* FIXED HEADER */}
      <Header title="Dashboard" />

      {/* MAIN CONTENT */}
      <main className="main-content">


        {/* DASHBOARD SECTIONS */}
        <div className="dashboard-content-area">
          {/* Welcome Section */}
          <section className="welcome-section">
            <h1 className="welcome-title">Welcome , {user?.name || 'User'}! 👋</h1>
            <p className="welcome-subtitle">Your {role || 'User'} workspace is ready</p>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              {quickActions.map((action) => (
                <Link
                  key={action.id}
                  to={action.path}
                  className="quick-action-card"
                >
                  <div className="action-icon">{action.icon}</div>
                  <div className="action-name">{action.name}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="recent-activity-section">
            <div className="activity-header">
              <h2 className="section-title">Recent Activity</h2>
              <Link to="/activity" className="view-all-link">View All →</Link>
            </div>
            <div className="activity-list">
              {recentActivities.length === 0 ? (
                <p className="no-activity">No recent activity yet</p>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="preview-box" style={{
                      backgroundColor: activity.previewBg || '#F3F4F6',
                      border: activity.stroke ? `1px solid ${activity.stroke}` : '1px solid #E5E7EB',
                    }}>
                      <span className="preview-box-icon">{activity.previewIcon || (activity.type === 'email' ? '📧' : (activity.type === 'poster' ? '🎨' : '🎯'))}</span>
                      <span className="preview-box-text">
                        {activity.type}
                      </span>
                    </div>
                    <div className="activity-details">
                      <p className="activity-title">{activity.title}</p>
                      <p className="activity-date">{activity.date}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        className={`activity-action ${activity.action.toLowerCase()}`}
                        onClick={() => handleAction(activity)}
                      >
                        {activity.action}
                      </button>
                      <button
                        className="activity-action delete"
                        onClick={(e) => handleDelete(e, activity)}
                        style={{
                          background: '#FEE2E2',
                          color: '#DC2626',
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
