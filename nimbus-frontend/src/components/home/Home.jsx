import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/Logo';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-container">
      {/* Top Navbar Area */}
      <nav className="home-nav">
        <div className="logo-section">
          <Logo className="home-logo" />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Intelligence at Your <span className="text-accent">Service!</span>
            </h1>
            <p className="hero-subtitle">Automate emails, posters, logos, and routine academic tasks instantly with Nimbus.</p>
            <button className="cta-button" onClick={handleCTA}>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started / Login'}
            </button>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <Logo className="footer-logo-svg" textColor="white" />
          </div>
          <p className="footer-subtext">Intelligence at your service.</p>
          <div className="footer-divider"></div>
          <p className="footer-copyright">© 2025 Nimbus</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
