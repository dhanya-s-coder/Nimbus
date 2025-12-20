import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { toast } from '../../../utils/toast';
import './verify-otp.css';

const VerifyOTP = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const source = searchParams.get('source') || 'signup'; // 'signup' or 'forgotPassword'
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes total validity
    const [resendTimeLeft, setResendTimeLeft] = useState(60); // 1 minute before resend is allowed
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { verifyOtp, resendOtp, verifyForgotPasswordOtp, resendForgotPasswordOtp } = useAuth();

    // Main timer effect - counts down OTP validity (3 minutes total)
    useEffect(() => {
        if (timeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Resend timer effect - enables resend button after 1 minute
    useEffect(() => {
        if (resendTimeLeft <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setInterval(() => {
            setResendTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendTimeLeft]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
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

        if (!email) {
            setError('Email not found. Please try again.');
            return;
        }

        setLoading(true);
        
        if (source === 'forgotPassword') {
            // Verify OTP for forgot password
            const result = await verifyForgotPasswordOtp(email, otpString);
            setLoading(false);

            if (result.success) {
                // Redirect back to forgot password page with OTP verified flag
                navigate(`/forgot-password?email=${encodeURIComponent(email)}&otpVerified=true`);
            } else {
                setError(result.error || 'OTP verification failed');
                setOtp(['', '', '', '', '', '']);
                document.getElementById('otp-0')?.focus();
            }
        } else {
            // Verify OTP for signup (original behavior)
            const result = await verifyOtp(email, otpString);
            setLoading(false);

            if (result.success) {
                toast.success('Email verified successfully! Redirecting to dashboard...');
                navigate('/dashboard');
            } else {
                setError(result.error || 'OTP verification failed');
                setOtp(['', '', '', '', '', '']);
                document.getElementById('otp-0')?.focus();
            }
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (!canResend) return;

        setError('');
        setLoading(true);
        
        const resendFunction = source === 'forgotPassword' ? resendForgotPasswordOtp : resendOtp;
        const result = await resendFunction(email);
        setLoading(false);

        if (result.success) {
            // Reset timers after resend
            setTimeLeft(180); // 3 minutes for new OTP
            setResendTimeLeft(60); // 1 minute before resend available again
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
            toast.success('New OTP sent to your email');
        } else {
            setError(result.error || 'Failed to resend OTP');
        }
    };

    return (
        <div className="verify-otp-container">
            {/* Left Panel - Branding */}
            <div className="verify-otp-left-panel">
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
                                <linearGradient id="otpGradient" x1="0" x2="1">
                                    <stop offset="0%" stopColor="#6EA8FF" />
                                    <stop offset="100%" stopColor="#3B6BFF" />
                                </linearGradient>
                            </defs>
                            <g transform="translate(40,80)">
                                <path
                                    d="M40 40 C80 10 140 10 180 40"
                                    stroke="url(#otpGradient)"
                                    strokeWidth="10"
                                    fill="none"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M50 70 C100 40 150 40 200 70"
                                    stroke="url(#otpGradient)"
                                    strokeWidth="10"
                                    fill="none"
                                    strokeLinecap="round"
                                    opacity="0.7"
                                />
                                <path
                                    d="M60 100 C120 70 160 70 220 100"
                                    stroke="url(#otpGradient)"
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
                    <h2 className="brand-headline">
                        Secure Your<br />
                        Account Today
                    </h2>
                    <p className="brand-subtitle">
                        Email verification is quick and easy. Complete in seconds.
                    </p>
                </div>
            </div>

            {/* Right Panel - OTP Form */}
            <div className="verify-otp-right-panel">
                <div className="verify-otp-form-container">
                    <h1 className="verify-otp-title">Verify Your Email</h1>
                    <p className="verify-otp-subtitle">
                        We've sent a 6-digit code to <strong>{email}</strong>
                    </p>

                    <form className="verify-otp-form" onSubmit={handleVerifyOtp}>
                        {/* OTP Input Grid */}
                        <div className="otp-input-group">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
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

                        {/* Timer and Resend */}
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
                                    <button
                                        type="button"
                                        className="resend-button"
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                    >
                                        {loading ? 'Sending...' : 'Request New Code'}
                                    </button>
                                </div>
                            )}
                            
                            {/* Resend Available Status */}
                            {timeLeft > 0 && (
                                <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                                    {canResend ? (
                                        <button
                                            type="button"
                                            className="resend-button"
                                            onClick={handleResendOtp}
                                            disabled={loading}
                                            style={{ 
                                                marginTop: '8px',
                                                padding: '8px 16px',
                                                fontSize: '13px'
                                            }}
                                        >
                                            {loading ? 'Sending...' : '🔄 Resend OTP'}
                                        </button>
                                    ) : (
                                        <span>Resend available in <strong>{resendTimeLeft}s</strong></span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="error-message">
                                <span className="error-icon">❌</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Verify Button */}
                        <button
                            type="submit"
                            className="verify-button"
                            disabled={loading || otp.join('').length !== 6}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Verifying...
                                </>
                            ) : (
                                '✓ Verify & Continue'
                            )}
                        </button>

                        {/* Info Box */}
                        <div className="otp-info-box">
                            <p>
                                <strong>Didn't receive the code?</strong>
                                <br />
                                Check your spam folder or wait for the resend button to become active.
                            </p>
                        </div>

                        {/* Back to Signup */}
                        <div className="back-to-signup">
                            <p>
                                {source === 'forgotPassword' ? (
                                    <>
                                        Want to try a different email?{' '}
                                        <button
                                            type="button"
                                            className="back-link"
                                            onClick={() => navigate('/forgot-password')}
                                        >
                                            Go back to password reset
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Want to use a different email?{' '}
                                        <button
                                            type="button"
                                            className="back-link"
                                            onClick={() => navigate('/signup')}
                                        >
                                            Go back to signup
                                        </button>
                                    </>
                                )}
                            </p>
                        </div>
                    </form>

                    <div className="verify-otp-footer">
                        © 2025 Nimbus Project. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
