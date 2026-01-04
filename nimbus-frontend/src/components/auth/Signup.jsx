import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthBranding from './auth-branding/AuthBranding';
import { toast } from '../../utils/toast';
import './auth.css';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Society Member');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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

        const res = await signup(name, email, password, confirmPassword, role);

        if (res.success) {
            toast.success("Account created! Please verify your email.");
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
        } else {
            const errorMsg = res.error || 'Signup failed';
            setFormError(errorMsg);
            toast.error(errorMsg);
        }
    };

    return (
        <div className="auth-page-container">
            <AuthBranding
                title={<>Start Your Journey <br /> with AI-Powered Tools</>}
                subtitle="Create stunning content and automate workflows in seconds."
            />

            <div className="auth-right-panel">
                <div className="auth-form-wrapper">
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join us to access smart academic tools.</p>

                    <form className="signup-form" onSubmit={handleSubmit}>
                        <div className="auth-input-group">
                            <label className="auth-label">Full Name</label>
                            <input
                                type="text"
                                className="auth-input"
                                placeholder="Agam Patel"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Email Address</label>
                            <input
                                type="email"
                                className="auth-input"
                                placeholder="abc@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">I am a...</label>
                            <select className="auth-input" style={{ height: '48px' }} value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value="Society Member">Society Member</option>
                                <option value="Professor">Professor</option>
                                <option value="Office Staff">Office Staff</option>
                            </select>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Password</label>
                            <div className="password-input-wrapper" style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="auth-input"
                                    placeholder="Enter password..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </div>
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Confirm Password</label>
                            <div className="password-input-wrapper" style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="auth-input"
                                    placeholder="Re-enter password..."
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <div
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                                >
                                    {showConfirmPassword ? "🙈" : "👁️"}
                                </div>
                            </div>
                        </div>

                        {(formError || authError) && (
                            <div className="auth-status-message auth-status-error">
                                {formError || authError}
                            </div>
                        )}

                        <button type="submit" className="auth-button">Sign Up</button>

                        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--color-text)' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: '700', textDecoration: 'none' }}>Log in</Link>
                        </div>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px', opacity: 0.5 }}>
                        © Nimbus. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;