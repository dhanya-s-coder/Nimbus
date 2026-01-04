import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../utils/toast';
import AuthBranding from './auth-branding/AuthBranding';
import './auth.css';

const VerifyOTP = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const source = searchParams.get('source') || 'signup'; // 'signup' or 'forgotPassword'
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(180);
    const [resendTimeLeft, setResendTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { verifyOtp, resendOtp, verifyForgotPasswordOtp, resendForgotPasswordOtp } = useAuth();

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        if (resendTimeLeft <= 0) { setCanResend(true); return; }
        const timer = setInterval(() => setResendTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [resendTimeLeft]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        const otpString = otp.join('');
        if (otpString.length !== 6) { setError('Please enter 6 digits'); return; }
        setLoading(true);
        const result = source === 'forgotPassword'
            ? await verifyForgotPasswordOtp(email, otpString)
            : await verifyOtp(email, otpString);
        setLoading(false);
        if (result.success) {
            if (source === 'forgotPassword') {
                navigate(`/forgot-password?email=${encodeURIComponent(email)}&otpVerified=true&otp=${otpString}`);
            } else {
                toast.success('Verified successfully!');
                navigate("/dashboard");
            }
        } else {
            const errorMsg = result.error || 'Verification failed';
            setError(errorMsg);
            toast.error(errorMsg);
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        setLoading(true);
        const result = source === 'forgotPassword' ? await resendForgotPasswordOtp(email) : await resendOtp(email);
        setLoading(false);
        if (result.success) {
            setTimeLeft(180); setResendTimeLeft(60); setCanResend(false); setOtp(['', '', '', '', '', '']);
            toast.success('OTP sent!');
        } else setError('Failed to resend');
    };

    return (
        <div className="auth-page-container">
            <AuthBranding
                title={<>Security First.<br />Verify Your Identity.</>}
                subtitle="We've sent a secure 6-digit code to your email address."
            />

            <div className="auth-right-panel">
                <div className="auth-form-wrapper">
                    <h1 className="auth-title">Verify Email</h1>
                    <p className="auth-subtitle">Code sent to <strong>{email}</strong></p>
                    <form className="verify-otp-form" onSubmit={handleVerifyOtp}>
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
                                />
                            ))}
                        </div>

                        {error && <div className="auth-status-message auth-status-error">{error}</div>}

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Verifying' : 'Verify Code'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            {canResend ? (
                                <button type="button" onClick={handleResendOtp} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontWeight: '700', cursor: 'pointer' }}>Resend Code</button>
                            ) : (
                                <span style={{ fontSize: '14px', opacity: 0.6 }}>Resend in {resendTimeLeft}s</span>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
