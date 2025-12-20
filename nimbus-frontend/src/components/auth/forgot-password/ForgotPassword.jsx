import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { toast } from '../../../utils/toast';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const otpVerified = searchParams.get('otpVerified') === 'true';
    const emailParam = searchParams.get('email') || '';

    // Stage states
    const [stage, setStage] = useState('email'); // 'email', 'otp', 'resetPassword'

    // Form states
    const [email, setEmail] = useState(emailParam);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(180);
    const [resendTimeLeft, setResendTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { sendForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword, resendForgotPasswordOtp } = useAuth();

    // Auto-advance to OTP stage if otpVerified is true
    useEffect(() => {
        if (otpVerified && emailParam) {
            setStage('resetPassword');
            setEmail(emailParam);
        }
    }, [otpVerified, emailParam]);

    // Timer effect for OTP expiry
    useEffect(() => {
        if (stage !== 'otp' || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, stage]);

    // Timer effect for resend availability
    useEffect(() => {
        if (stage !== 'otp' || resendTimeLeft <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setInterval(() => {
            setResendTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendTimeLeft, stage]);

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email is required');
            return;
        }

        setLoading(true);
        const result = await sendForgotPasswordOtp(email);
        setLoading(false);

        if (result.success) {
            setStage('otp');
            setOtp(['', '', '', '', '', '']);
            setTimeLeft(180);
            setResendTimeLeft(60);
            setCanResend(false);
            document.getElementById('otp-0')?.focus();
        } else {
            setError(result.error || 'Failed to send OTP');
        }
    };

    // Step 2: Handle OTP input
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-forgot-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-forgot-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        const result = await verifyForgotPasswordOtp(email, otpString);
        setLoading(false);

        if (result.success) {
            setStage('resetPassword');
            // Do NOT clear OTP here, we need it for the next step!
        } else {
            setError(result.error || 'OTP verification failed');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-forgot-0')?.focus();
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        setError('');
        setLoading(true);
        const result = await resendForgotPasswordOtp(email);
        setLoading(false);

        if (result.success) {
            setTimeLeft(180);
            setResendTimeLeft(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-forgot-0')?.focus();
            toast.success('New OTP sent to your email');
        } else {
            setError(result.error || 'Failed to resend OTP');
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (!newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const otpString = otp.join('');
        const result = await resetPassword(email, otpString, newPassword, confirmPassword);
        setLoading(false);

        if (result.success) {
            setSuccessMessage('✓ Password reset successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } else {
            setError(result.error || 'Failed to reset password');
        }
    };

    return (
        <div className="fp-container">
            {/* Left Panel - Branding */}
            <div className="fp-left-panel">
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
                                <linearGradient id="fpGradient" x1="0" x2="1">
                                    <stop offset="0%" stopColor="#6EA8FF" />
                                    <stop offset="100%" stopColor="#3B6BFF" />
                                </linearGradient>
                            </defs>
                            <g transform="translate(40,80)">
                                <path 
                                    d="M40 40 C80 10 140 10 180 40"
                                    stroke="url(#fpGradient)"
                                    strokeWidth="10"
                                    fill="none"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M50 70 C100 40 150 40 200 70"
                                    stroke="url(#fpGradient)"
                                    strokeWidth="10"
                                    fill="none"
                                    strokeLinecap="round"
                                    opacity="0.7"
                                />
                                <path
                                    d="M60 100 C120 70 160 70 220 100"
                                    stroke="url(#fpGradient)"
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
                    <h2 className="brand-headline" style={{ color: '#0F1724' }}>
                        Recover Your Account<br />
                        Securely
                    </h2>
                    <p className="brand-subtitle" style={{ color: '#0F1724' }}>
                        We'll help you reset your password in just a few steps.
                    </p>
                    <div className="brand-illustration">
                        <svg width="380" height="300" viewBox="0 0 380 300" xmlns="http://www.w3.org/2000/svg">
                            {/* Lock / Security Illustration */}
                            <rect x="150" y="120" width="80" height="60" rx="8" fill="none" stroke="#4C6FFF" strokeWidth="3" />
                            <path d="M165 120 V100 A25 25 0 0 1 215 100 V120" fill="none" stroke="#4C6FFF" strokeWidth="3" />
                            <circle cx="190" cy="150" r="5" fill="#4C6FFF" />
                            <path d="M190 155 V165" stroke="#4C6FFF" strokeWidth="3" strokeLinecap="round" />
                            <circle cx="190" cy="140" r="90" fill="none" stroke="#A5B4FC" strokeWidth="1.5" strokeDasharray="6 6" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="fp-right-panel">
                <div className="fp-form-container">

                    {successMessage && (
                        <div className="success-message-box" style={{ marginBottom: '24px' }}>
                            <p style={{ margin: 0, color: '#10B981' }}>{successMessage}</p>
                        </div>
                    )}

                    {/* STAGE 1: Email Input */}
                    {stage === 'email' && (
                        <>
                            <h1 className="fp-title">Reset Your Password</h1>
                            <p className="fp-subtitle">Enter your email address to get started.</p>

                            <form className="fp-form" onSubmit={handleSendOtp}>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="Enter your email..."
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {error && (
                                    <div className="error-message">
                                        <span className="error-icon">❌</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button type="submit" className="fp-button" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>

                                <div className="fp-divider"></div>

                                <div className="back-to-login">
                                    Remember your password? <Link to="/login" className="login-link">Back to Login</Link>
                                </div>
                            </form>
                        </>
                    )}

                    {/* STAGE 2: OTP Verification */}
                    {stage === 'otp' && (
                        <>
                            <h1 className="fp-title">Verify Your Email</h1>
                            <p className="fp-subtitle">
                                We've sent a 6-digit code to <strong>{email}</strong>
                            </p>

                            <form className="fp-form" onSubmit={handleVerifyOtp}>
                                <div className="otp-input-group">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-forgot-${index}`}
                                            type="text"
                                            maxLength="1"
                                            className="otp-input"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            placeholder="0"
                                            disabled={loading}
                                        />
                                    ))}
                                </div>

                                <div className="otp-timer-section">
                                    {timeLeft > 0 ? (
                                        <div className="timer-display">
                                            <span className="timer-icon">⏱️</span>
                                            <span className="timer-text">
                                                Code expires in <strong>{timeLeft}s</strong>
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="resend-section">
                                            <p className="resend-message">Code expired</p>
                                        </div>
                                    )}

                                    {timeLeft > 0 && (
                                        <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                                            {canResend ? (
                                                <button
                                                    type="button"
                                                    className="resend-button"
                                                    onClick={handleResendOtp}
                                                    disabled={loading}
                                                    style={{ marginTop: '8px', padding: '8px 16px', fontSize: '13px' }}
                                                >
                                                    {loading ? 'Sending...' : '🔄 Resend OTP'}
                                                </button>
                                            ) : (
                                                <span>Resend available in <strong>{resendTimeLeft}s</strong></span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="error-message">
                                        <span className="error-icon">❌</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="fp-button"
                                    disabled={loading || otp.join('').length !== 6}
                                >
                                    {loading ? 'Verifying...' : '✓ Verify & Continue'}
                                </button>

                                <div className="back-to-login">
                                    <button
                                        type="button"
                                        className="login-link"
                                        onClick={() => setStage('email')}
                                    >
                                        Use a different email
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {/* STAGE 3: Reset Password */}
                    {stage === 'resetPassword' && (
                        <>
                            <h1 className="fp-title">Create New Password</h1>
                            <p className="fp-subtitle">Enter a strong password to secure your account.</p>

                            <form className="fp-form" onSubmit={handleResetPassword}>
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-input"
                                            placeholder="Enter new password..."
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Confirm Password</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            className="form-input"
                                            placeholder="Confirm your password..."
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="error-message">
                                        <span className="error-icon">❌</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button type="submit" className="fp-button" disabled={loading}>
                                    {loading ? 'Resetting Password...' : '🔒 Reset Password'}
                                </button>

                                <div className="back-to-login">
                                    <button
                                        type="button"
                                        className="login-link"
                                        onClick={() => setStage('otp')}
                                    >
                                        Get a new OTP
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    <div className="helper-text" style={{ marginTop: '40px' }}>
                        Protected by Nimbus Security
                    </div>
                    <div className="fp-footer">
                        © 2025 Nimbus Project. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
