import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './signup.css';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Student');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Visibility toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { signup, error: authError } = useAuth();
    const navigate = useNavigate();
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!name || !email || !password || !confirmPassword) {
            setFormError("Please fill in all required fields.");
            return;
        }

        if (password !== confirmPassword) {
            setFormError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setFormError("Password must be at least 6 characters.");
            return;
        }

        // Call signup from AuthContext (sends OTP)
        const res = await signup(name, email, password, confirmPassword, role);

        if (res.success) {
            // Redirect to OTP verification page
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
        } else {
            setFormError(res.error || 'Signup failed');
        }
    };

    return (
        <div className="signup-container">
            {/* Left Panel - Branding (Same as Login) */}
            <div className="signup-left-panel">
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
                        Start Your Journey<br />
                        with AI-Powered Tools
                    </h2>
                    <p className="brand-subtitle" style = {{color: '#0F1724'}}>
                        Create stunning content and automate workflows in seconds.
                    </p>
                    <div className="brand-illustration">
                        <svg width="380" height="300" viewBox="0 0 380 300" xmlns="http://www.w3.org/2000/svg">

                            {/* Slightly modified illustration or same? Same is fine for consistency */}
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
                            <circle cx="215" cy="165" r="22" fill="none" stroke="#4C6FFF" strokeWidth="3" />
                            <circle cx="215" cy="165" r="5" fill="#4C6FFF" />
                            <circle cx="215" cy="165" r="70" fill="none" stroke="#A5B4FC" strokeWidth="1.5" strokeDasharray="4 6" />
                            <rect x="205" y="70" width="45" height="28" rx="4" fill="none" stroke="#4C6FFF" strokeWidth="2" />
                            <circle cx="295" cy="195" r="24" fill="none" stroke="#4C6FFF" strokeWidth="2" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="signup-right-panel">
                <div className="signup-form-container">
                    <h1 className="signup-title">Create Account</h1>
                    <p className="signup-subtitle">Join us to access smart academic tools.</p>

                    <form className="signup-form" onSubmit={handleSubmit}>

                        {/* Full Name */}
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="email@university.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Role */}
                        <div className="form-group">
                            <label className="form-label">I am a...</label>
                            <select
                                className="form-select"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="Student">Student /Society Member</option>
                                <option value="Professor">Professor</option>
                                <option value="Staff">Staff Member</option>
                            </select>
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-input"
                                    placeholder="Enter password..."
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

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="form-input"
                                    placeholder="Re-enter password..."
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <div
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? "🙈" : "👁️"}
                                </div>
                            </div>
                        </div>

                        {(formError || authError) && (
                            <div style={{ color: '#EF4444', fontSize: '14px', textAlign: 'center' }}>
                                {formError || authError}
                            </div>
                        )}

                        <button type="submit" className="signup-button">Sign Up</button>

                        <div className="signup-divider">
                            <span>OR</span>
                        </div>

                        <div className="login-prompt">
                            Already have an account? <Link to="/login" className="login-link">Log in</Link>
                        </div>
                    </form>

                    <div className="helper-text">
                        Protected by Nimbus Security
                    </div>
                    <div className="signup-footer">
                        © 2025 Nimbus Project. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
