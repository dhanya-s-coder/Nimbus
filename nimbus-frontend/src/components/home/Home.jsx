import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
      {/* Logo Section */}
      <div className="logo-section">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 600 220"
          className="home-logo"
        >
          <defs>
            <linearGradient id="homeGradient" x1="0" x2="1">
              <stop offset="0%" stopColor="#6EA8FF" />
              <stop offset="100%" stopColor="#3B6BFF" />
            </linearGradient>
          </defs>
          <g transform="translate(40,80)">
            <path
              d="M40 40 C80 10 140 10 180 40"
              stroke="url(#homeGradient)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M50 70 C100 40 150 40 200 70"
              stroke="url(#homeGradient)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M60 100 C120 70 160 70 220 100"
              stroke="url(#homeGradient)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              opacity="0.5"
            />
          </g>
          <text
            x="300"
            y="175"
            fontFamily="Inter, Arial"
            fontSize="56"
            fontWeight="700"
            fill="#06283D"
          >
            NIMBUS
          </text>
        </svg>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Your Internal AI Assistant for Academic Workflows</h1>
            <p className="hero-subtitle">Automate emails, posters, logos, and routine tasks instantly.</p>
            <button className="cta-button" onClick={handleCTA}>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started / Login'}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">What Nimbus Can Do</h2>
        <div className="features-grid">
          {/* Email Feature */}
          <div className="feature-card">
            <div className="feature-icon">📧</div>
            <h3>Generate Emails Instantly</h3>
            <p>Create professional emails in seconds for any occasion.</p>
          </div>

          {/* Poster Feature */}
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Create Posters & Banners</h3>
            <p>Design eye-catching posters and banners effortlessly.</p>
          </div>

          {/* Logo Feature */}
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Generate Logo Ideas</h3>
            <p>Get creative logo concepts tailored to your needs.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      {/* <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Select Your Role</h3>
            <p>Choose your role to personalize your experience.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Choose a Task Template</h3>
            <p>Pick from predefined templates for your task.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Generate & Edit Output</h3>
            <p>Get instant results and refine them to perfection.</p>
          </div>
        </div>
      </section> */}

      {/* Automation Flows Section */}
      <section className="how-it-works-section">
        <h2 className="section-title">Smart Automation Flows</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">⚡</div>
            <h3>Email Automation</h3>
            <p>Generate, edit, and send professional emails in one smooth flow.</p>
          </div>

          <div className="step-card">
            <div className="step-number">🎨</div>
            <h3>Poster Generation</h3>
            <p>Create event posters and banners using intelligent templates.</p>
          </div>

          <div className="step-card">
            <div className="step-number">🧠</div>
            <h3>AI Logo Concepts</h3>
            <p>Get clean, usable logo ideas instantly for clubs or departments.</p>
          </div>
        </div>
      </section>


      {/* Roles Section */}
      {/* <section className="roles-section">
        <h2 className="section-title">Tailored For Every Role</h2>
        <div className="roles-grid">
          <div className="role-card">
            <div className="role-icon">👨‍🏫</div>
            <h3>Professors</h3>
            <p>Automate course materials, announcements, and grading communications.</p>
          </div>

          <div className="role-card">
            <div className="role-icon">💼</div>
            <h3>Office Staff</h3>
            <p>Streamline administrative tasks and official communications.</p>
          </div>

          <div className="role-card">
            <div className="role-icon">👥</div>
            <h3>Society Members</h3>
            <p>Organize events, create promotions, and manage communications effortlessly.</p>
          </div>
        </div>
      </section> */}

        {/* Why Nimbus Section */}
        <section className="roles-section">
          <h2 className="section-title">Why Choose Nimbus?</h2>
          <div className="roles-grid">
            <div className="role-card">
              <div className="role-icon">⏱️</div>
              <h3>Save Time</h3>
              <p>Reduce repetitive administrative work and focus on what matters.</p>
            </div>

            <div className="role-card">
              <div className="role-icon">🎯</div>
              <h3>Consistent Quality</h3>
              <p>Generate structured, professional outputs every single time.</p>
            </div>

            <div className="role-card">
              <div className="role-icon">🔒</div>
              <h3>Role-Aware & Secure</h3>
              <p>Personalized workflows with proper access control.</p>
            </div>
          </div>
        </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Start Automating Your Work Today</h2>
        <button className="cta-button cta-button-large" onClick={handleCTA}>
          {isAuthenticated ? 'Go to Dashboard' : 'Login / Get Started'}
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 600 220"
              className="footer-logo-svg"
            >
              <defs>
                <linearGradient id="footerGradient" x1="0" x2="1">
                  <stop offset="0%" stopColor="#6EA8FF" />
                  <stop offset="100%" stopColor="#3B6BFF" />
                </linearGradient>
              </defs>
              <g transform="translate(40,80)">
                <path
                  d="M40 40 C80 10 140 10 180 40"
                  stroke="url(#footerGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M50 70 C100 40 150 40 200 70"
                  stroke="url(#footerGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.7"
                />
                <path
                  d="M60 100 C120 70 160 70 220 100"
                  stroke="url(#footerGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </g>
              <text
                x="300"
                y="175"
                fontFamily="Inter, Arial"
                fontSize="56"
                fontWeight="700"
                fill="#06283D"
              >
                NIMBUS
              </text>
            </svg>
            <span>Nimbus</span>
          </div>
          <p className="footer-text">Nimbus — Internal AI Assistant</p>
          <p className="footer-subtext">© 2025 Nimbus Project • About • Contact • Privacy</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
