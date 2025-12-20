import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useHistory } from '../../../context/HistoryContext';
import { API_ENDPOINTS, fetchWithAuth } from '../../../api/config';
import { toast } from '../../../utils/toast';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../common/Sidebar';
import Header from '../../common/Header';
import '../../dashboard/dashboard.css'; // Common layout styles
import './activity.css'; // Specific tool styles

const Activity = () => {
  const { user, role, logout } = useAuth();
  const { historyItems, loading, refreshHistory, deleteActivity } = useHistory();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All');

  const filterTabs = ['All', 'Emails', 'Posters', 'Logos', 'Drafts'];

  const filteredItems = historyItems.filter(item => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Emails') return item.type === 'email';
    if (activeTab === 'Posters') return item.type === 'poster';
    if (activeTab === 'Logos') return item.type === 'logo';
    if (activeTab === 'Drafts') return item.status === 'draft';
    return true;
  });

  const handleView = (item) => {
    if (item.type === 'email') {
      navigate('/email-draft', { state: { emailData: item } });
    } else {
      toast.info(`Viewing ${item.type} details`);
    }
  };

  const handleEdit = (item) => {
    if (item.type === 'email') {
      navigate('/email-draft', { state: { emailData: item } });
    } else {
      toast.info(`Editing ${item.type} coming soon`);
    }
  };

  const handleDelete = async (item) => {
    try {
      await deleteActivity(item.id);
      toast.success("Item deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete item");
    }
  };

  const getActionHandler = (item) => {
    if (item.status === 'sent') {
      return () => handleView(item);
    } else if (item.status === 'draft') {
      return () => handleEdit(item);
    }
    return () => handleView(item);
  };

  return (
    <div className="dashboard-page">
      <Header title="History" />

      <main className="main" style={{ display: 'flex', flexDirection: 'column' }}>


        {/* CONTENT GRID */}
        <div style={{ display: 'flex', gap: '32px', height: '100%', alignItems: 'flex-start' }}>

          {/* MAIN COLUMN: FILTER TABS & LIST */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F1724', marginBottom: '16px' }}>Your Generated Items</h3>

            {/* Filter Tabs */}
            <div className="filter-tabs-container">
              {filterTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`filter-tab-btn ${activeTab === tab ? 'active' : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* List Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                  Loading your history...
                </div>
              ) : filteredItems.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                  No items found for this filter.
                </div>
              ) : (
                filteredItems.map(item => (
                  <div key={item.id} className="history-item-card">
                    {/* Preview Box */}
                    <div className="preview-box" style={{
                      backgroundColor: item.previewBg,
                      border: item.stroke ? `1px solid ${item.stroke}` : '1px solid #D1D5DB',
                    }}>
                      <span style={{ fontSize: '24px' }}>{item.previewIcon}</span>
                      <span className="preview-box-text">
                        {item.type}
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '16px', color: '#111827', marginBottom: '4px', fontWeight: '500' }}>{item.title}</h4>
                      <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>{item.prompt}</p>
                      <p style={{ fontSize: '12px', color: '#94A3B8' }}>{item.date}</p>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        className={`activity-action ${item.action.toLowerCase()}`}
                        onClick={getActionHandler(item)}
                      >
                        {item.action}
                      </button>
                      <button
                        className="activity-action delete"
                        onClick={() => handleDelete(item)}
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


          </div>

        </div>
      </main>
    </div>
  );
};

export default Activity;
