import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './dashboard.css';
import RecentActivity from '../common/RecentActivity';
import '../tools/history/activity.css';

// guess which poster template a sentence is about
const guessTemplate = (text) => {
  const t = text.toLowerCase();
  if (/hackathon|coding|code ?sprint|contest|competition|datathon/.test(t)) return 'hackathon';
  if (/recruit|hiring|join (our|the) team|apply|membership|volunteer/.test(t)) return 'recruitment';
  if (/lecture|seminar|talk|guest|symposium|workshop|webinar|speaker/.test(t)) return 'academic';
  if (/notice|announce|closed|closure|holiday|circular|deadline extended/.test(t)) return 'announcement';
  return 'event';
};

const EXAMPLES = [
  'Hackathon on 14-15 Feb at the Main Auditorium, Rs 40,000 prizes',
  'Guest lecture on AI in healthcare, 15 Jan 10 AM, Seminar Hall A',
  'Freshers welcome fest on 12 August, live music and games',
  'Notice: library closed on Friday for maintenance',
];

const Dashboard = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [idea, setIdea] = useState('');

  const startPoster = (text = idea) => {
    const brief = text.trim();
    if (!brief) { navigate('/poster-generator'); return; }
    navigate('/poster-generator', { state: { quickStart: { template: guessTemplate(brief), brief, autoCreate: true } } });
  };

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
    {
      id: 5,
      name: 'Knowledge Base',
      icon: '🧠',
      path: '/knowledge',
      description: 'Teach Nimbus your club, brand and past events'
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

          {/* One-line start */}
          <section className="quickstart">
            <h2 className="quickstart-title">What do you want to create today?</h2>
            <form className="quickstart-bar" onSubmit={(e) => { e.preventDefault(); startPoster(); }}>
              <input
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your poster in a sentence — Nimbus does the rest"
                aria-label="Describe your poster"
              />
              <button type="submit">✨ Create poster</button>
            </form>
            <div className="quickstart-examples">
              {EXAMPLES.map((ex) => (
                <button key={ex} type="button" onClick={() => startPoster(ex)}>{ex}</button>
              ))}
            </div>
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
