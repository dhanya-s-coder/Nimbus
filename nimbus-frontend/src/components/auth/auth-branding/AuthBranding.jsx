import React from 'react';
import Logo from '../../../assets/Logo';
import './auth-branding.css';

const AuthBranding = ({ title, subtitle }) => {
    return (
      <div className="auth-left-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <Logo className="auth-logo-svg" />
          </div>
          <h2 className="auth-brand-headline">
            {title || "Intelligence at your service"}
          </h2>
          <p className="auth-brand-subtitle">
            {subtitle ||
              "Automate emails, posters, logos, and routine academic tasks instantly."}
          </p>
        </div>
      </div>
    );
};

export default AuthBranding;
