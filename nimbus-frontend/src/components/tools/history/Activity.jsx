import React, { useState } from 'react';
import { useHistory } from '../../../context/HistoryContext';
import { toast } from '../../../utils/toast';
import { useNavigate, useLocation } from 'react-router-dom';
import './activity.css'; // Specific tool styles

const Activity = () => {
  const { historyItems, loading, deleteActivity } = useHistory();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(location.state?.initialFilter || 'All');

  const filterTabs = ['All', 'Emails', 'Posters', 'Logos', 'Reports', 'Drafts'];

  const filteredItems = historyItems.filter(item => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Emails') return item.type === 'email';
    if (activeTab === 'Posters') return item.type === 'poster';
    if (activeTab === 'Logos') return item.type === 'logo';
    if (activeTab === 'Reports') return item.type === 'report';
    if (activeTab === 'Drafts') return item.status === 'draft';
    return true;
  });

  const handleAction = (item) => {
    if (item.type === 'email') {
      navigate('/email-generator', { state: { emailData: item } });
    } else if (item.type === 'poster') {
      navigate('/poster-generator', { state: { posterData: item } });
    } else if (item.type === 'logo') {
      navigate('/logo-generator', { state: { logoData: item } });
    } else if (item.type === 'report') {
      navigate('/report-generator', { state: { Data: item } });
    } else {
      toast.info(`Viewing ${item.type} details`);
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

  return (
    <div className="dashboard-page">
      <main className="main-content">
        <div className="activity-page-container">
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
          <div className="activity-list">
            {loading ? (
              <div className="activity-empty">
                <h3>Loading your history...</h3>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="activity-empty">
                <h3>No items found.</h3>
                <p>Try adjusting your filter or generate something new.</p>
              </div>
            ) : (
              filteredItems.map(item => (
                <div key={item.id} className="activity-item">
                  {/* Preview Box */}
                  <div className="preview-box">
                    <span className="preview-box-icon">
                      {item.previewIcon || (item.type?.toLowerCase() === 'email' ? '📧' : item.type?.toLowerCase() === 'logo' ? '🎯' : item.type?.toLowerCase() === 'report' ? '📊' : '🎨')}
                    </span>
                    <span className="preview-box-text">
                      {item.type}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="activity-details">
                    <h4 className="activity-title">{item.title}</h4>
                    <p className="activity-prompt">{item.prompt}</p>
                    <p className="activity-date">{item.date}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="activity-actions">
                    <button
                      className={`activity-action ${item.status === 'draft' ? 'edit' : 'view'}`}
                      onClick={() => handleAction(item)}
                    >
                      {item.status === 'draft' ? 'Edit' : 'View'}
                    </button>
                    <button
                      className="activity-action delete"
                      onClick={() => handleDelete(item)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Activity;
