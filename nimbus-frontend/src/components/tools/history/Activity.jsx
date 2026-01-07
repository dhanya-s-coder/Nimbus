import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import RecentActivity from '../../common/RecentActivity';
import './activity.css'; // Specific tool styles

const Activity = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.initialFilter || 'All');

  const filterTabs = ['All', 'Emails', 'Posters', 'Logos', 'Reports', 'Drafts'];

  return (
    <div className="dashboard-page">
      <main className="main-content">
        <div className="activity-page-container">
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
           <RecentActivity
            filterType={activeTab}
            limit={null}
            showViewAll={false}
            title={null}
          />
        </div>
      </main>
    </div>
  );
};

export default Activity;
