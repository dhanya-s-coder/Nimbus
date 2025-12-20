import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './login.css';

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

        if (!email || !password) {
            setFormError("Please fill in all fields.");
            return;
        }

        const res = await login(email, password);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setFormError(res.error || 'Login failed');
        }
    };

    return (
        <div className="login-container">
            {/* Left Panel - Branding */}
            <div className="login-left-panel">
                <div className="brand-content">
                    <div className="brand-logo">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 600 220"
                            className="brand-logo-svg"
                            width="300"
                            height="auto"
                        >
                            <defs>
                                <linearGradient id="loginGradient" x1="0" x2="1">
                                    <stop offset="0%" stopColor="#6EA8FF" />
                                    <stop offset="100%" stopColor="#3B6BFF" />
                                </linearGradient>
                            </defs>
                            <g transform="translate(40,80)">
                                <path
                                    d="M40 40 C80 10 140 10 180 40"
                                    stroke="url(#loginGradient)"
                                    strokeWidth="10"
                                    fill="none"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M50 70 C100 40 150 40 200 70"
                                    stroke="url(#loginGradient)"
                                    strokeWidth="10"
                                    fill="none"
                                    strokeLinecap="round"
                                    opacity="0.7"
                                />
                                <path
                                    d="M60 100 C120 70 160 70 220 100"
                                    stroke="url(#loginGradient)"
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
                    <h2 className="brand-headline" style = {{color: '#0F1724'}}>
                        Your Internal AI Assistant<br />
                        for Academic Workflows
                    </h2>
                    <p className="brand-subtitle" style = {{color: '#0F1724'}}>
                        Automate emails, posters, logos, and routine tasks instantly.
                    </p>
                    <div className="brand-illustration">
                        <svg width="380" height="300" viewBox="0 0 380 300" xmlns="http://www.w3.org/2000/svg">
                            {/* Central cloud */}
                            <path d="M160 155
                                   Q160 125 190 125
                                   Q205 110 225 120
                                   Q260 120 265 150
                                   Q290 155 290 180
                                   Q290 210 260 215
                                   L175 215
                                   Q140 210 140 180
                                   Q140 160 160 155Z"
                                fill="none" stroke="#4C6FFF" strokeWidth="3" />

                            {/* AI Node */}
                            <circle cx="215" cy="165" r="22" fill="none" stroke="#4C6FFF" strokeWidth="3" />
                            <circle cx="215" cy="165" r="5" fill="#4C6FFF" />

                            {/* Orbit lines */}
                            <circle cx="215" cy="165" r="70" fill="none" stroke="#A5B4FC" strokeWidth="1.5" strokeDasharray="4 6" />

                            {/* Orbiting Icons */}
                            {/* Email */}
                            <rect x="205" y="70" width="45" height="28" rx="4" fill="none" stroke="#4C6FFF" strokeWidth="2" />
                            <path d="M205 70 L227 86 L250 70" fill="none" stroke="#4C6FFF" strokeWidth="2" />

                            {/* Poster */}
                            <rect x="100" y="155" width="50" height="65" rx="6" fill="none" stroke="#4C6FFF" strokeWidth="2" />

                            {/* Logo */}
                            <circle cx="295" cy="195" r="24" fill="none" stroke="#4C6FFF" strokeWidth="2" />
                            <circle cx="295" cy="195" r="10" fill="none" stroke="#4C6FFF" strokeWidth="2" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="login-right-panel">
                <div className="login-form-container">
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Please enter your details to sign in.</p>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your email..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-input"
                                    placeholder="Enter your password..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </div>
                            </div>
                        </div>

                        <div className="forgot-password-container">
                            <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
                        </div>

                        {(formError || authError) && <div style={{ color: '#EF4444', fontSize: '14px', textAlign: 'center', marginBottom: '10px' }}>{formError || authError}</div>}

                        <button type="submit" className="login-button">Log In</button>

                        <div className="login-divider">
                            <span>OR</span>
                        </div>

                        <div className="signup-prompt">
                            Don't have an account? <Link to="/signup" className="signup-link">Sign up</Link>
                        </div>
                    </form>

                    <div className="helper-text" style={{ textAlign: 'center', marginTop: '20px' }}>
                        Protected by Nimbus Security
                    </div>
                    <div className="login-footer">
                        © 2025 Nimbus Project. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
