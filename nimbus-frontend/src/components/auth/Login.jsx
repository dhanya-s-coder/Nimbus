import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthBranding from './auth-branding/AuthBranding';
import { toast } from '../../utils/toast';
import './auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      if (!email || !password) {
        setFormError("Please fill in all fields.");
        return;
      }

      const res = await login(email, password);
      if (res.success) {
        toast.success("Welcome back! Login successful.");
        navigate('/dashboard');
      } else {
        const errorMsg = res.error || 'Login failed';
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setFormError("An unexpected error occurred.");
      toast.error("Something went wrong. Please check your connection.");
    }
  };

  return (
    <div className="auth-page-container">
      <AuthBranding
        title={
          <>
            Your Internal AI Assistant
            <br />
            for Academic Workflows
          </>
        }
        subtitle="Efficiently automate emails, posters, logos, and routine tasks in seconds."
      />

      <div className="auth-right-panel">
        <div className="auth-form-wrapper">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to your account to continue.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label className="auth-label">Email Address</label>
              <input
                type="email"
                className="auth-input"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Password</label>
              <div
                className="password-input-wrapper"
                style={{ position: "relative" }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Enter your password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </div>
              </div>
            </div>

            <div
              className="forgot-password-container"
              style={{ textAlign: "right", marginBottom: "16px" }}
            >
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "13px",
                  color: "var(--color-accent)",
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </Link>
            </div>

            {(formError || authError) && (
              <div className="auth-status-message auth-status-error">
                {formError || authError}
              </div>
            )}

            <button type="submit" className="auth-button">
              Log In
            </button>

            <div
              className="signup-prompt"
              style={{
                textAlign: "center",
                marginTop: "24px",
                fontSize: "14px",
                color: "var(--color-text)",
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{
                  color: "var(--color-accent)",
                  fontWeight: "700",
                  textDecoration: "none",
                }}
              >
                Sign up
              </Link>
            </div>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: "40px",
              fontSize: "12px",
              opacity: 0.5,
            }}
          >
            © Nimbus. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;