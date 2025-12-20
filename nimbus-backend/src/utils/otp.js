export const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
};
export const getOtpExpirationTime = () => {
    const now = new Date();
    return new Date(now.getTime() + 180000); // 180 seconds = 3 minutes
};
export const getResendEnabledTime = () => {
    const now = new Date();
    return new Date(now.getTime() + 60000); // 60 seconds = 1 minute before resend is allowed
};


export const isValidOtpFormat = (otp) => {
    return /^\d{6}$/.test(otp);
};


export const generateOtpEmailTemplate = (otp, userName, type = 'Signup') => {
    const title = type === 'Password Reset' ? 'Reset Your Password' : 'Email Verification';
    const message = type === 'Password Reset' 
        ? 'To reset your password and regain access to your account, please use the One-Time Password (OTP) below:'
        : 'To complete your signup and verify your email address, please use the One-Time Password (OTP) below:';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #6EA8FF 0%, #3B6BFF 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 16px;
            color: #333;
            margin-bottom: 20px;
        }
        .otp-section {
            background-color: #f8f9fa;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 25px;
            text-align: center;
            margin: 25px 0;
        }
        .otp-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        .otp-code {
            font-size: 42px;
            font-weight: 800;
            color: #3B6BFF;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 15px 0;
            background-color: #ffffff;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #3B6BFF;
        }
        .otp-timer {
            font-size: 14px;
            color: #EF4444;
            font-weight: 600;
            margin-top: 10px;
        }
        .info-box {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #333;
        }
        .info-box strong {
            color: #D97706;
        }
        .footer-text {
            font-size: 13px;
            color: #666;
            line-height: 1.6;
            margin-top: 25px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
        }
        .footer-text a {
            color: #3B6BFF;
            text-decoration: none;
        }
        .footer-text a:hover {
            text-decoration: underline;
        }
        .support-info {
            background-color: #f0f4ff;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            font-size: 13px;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 NIMBUS</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">${title}</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                <strong>Hi ${userName},</strong>
                <p>${type === 'Password Reset' ? 'We received a request to reset your password.' : 'Welcome to Nimbus! Your AI-powered content creation platform.'}</p>
            </div>
            
            <p>${message}</p>
            
            <div class="otp-section">
                <div class="otp-label">Your One-Time Password</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-timer">⏱️ This OTP expires in <strong>3 minutes</strong></div>
                <div style="font-size: 12px; color: #666; margin-top: 8px;">You can request a new code after 1 minute if needed.</div>
            </div>
            
            <div class="info-box">
                <strong>⚠️ Important:</strong> Never share this OTP with anyone. Nimbus will never ask for your OTP via email or phone.
            </div>
            
            <p style="color: #333; line-height: 1.6;">
                If you didn't request this ${type === 'Password Reset' ? 'password reset' : 'verification'}, you can safely ignore this email. If you need help, contact our support team at 
                <a href="mailto:support@nimbus.com" style="color: #3B6BFF; text-decoration: none;">support@nimbus.com</a>
            </p>
            
            <div class="support-info">
                <p style="margin: 0;">
                    <strong>Troubleshooting:</strong> If you don't receive the verification code, 
                    check your spam/junk folder or request a new OTP.
                </p>
            </div>
            
            <div class="footer-text">
                <p style="margin: 0;">Best regards,<br><strong>The Nimbus Team</strong></p>
                <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
                    © 2025 Nimbus Project. All rights reserved. | 
                    <a href="#">Privacy Policy</a> | 
                    <a href="#">Terms of Service</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

/**
 * Generate OTP plain text email
 * @param {string} otp - 6-digit OTP
 * @param {string} userName - User's name
 * @returns {string} Plain text email
 */
export const generateOtpPlainText = (otp, userName) => {
    return `
Hi ${userName},

Welcome to Nimbus! Your AI-powered content creation platform.

To complete your signup and verify your email address, please use the following One-Time Password (OTP):

${otp}

This OTP expires in 3 minutes. You can request a new code after 1 minute if needed.

⚠️ Important: Never share this OTP with anyone. Nimbus will never ask for your OTP via email or phone.

If you didn't request this OTP, you can safely ignore this email.

If you need help, contact our support team at support@nimbus.com

Best regards,
The Nimbus Team

© 2025 Nimbus Project. All rights reserved.
    `;
};

/**
 * Generate password changed confirmation email (plain text)
 * @param {string} userName - User's name
 * @param {string} resetLink - Link to forgot password page for security
 * @returns {string} Plain text email
 */
export const generatePasswordChangedPlainText = (userName, resetLink) => {
    return `
Hi ${userName},

Your password has been changed successfully!

If this was you, you can safely disregard this email.

🔒 SECURITY ALERT: If you didn't make this change and believe your account may have been compromised, please reset your password immediately:

${resetLink}

Need help? Contact us at support@nimbus.com

Best regards,
The Nimbus Security Team

© 2025 Nimbus Project. All rights reserved.
    `;
};

/**
 * Generate password changed confirmation email (HTML)
 * @param {string} userName - User's name
 * @param {string} resetLink - Link to forgot password page for security
 * @returns {string} HTML email
 */
export const generatePasswordChangedEmailTemplate = (userName, resetLink) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 30px;
        }
        .success-icon {
            text-align: center;
            font-size: 48px;
            margin: 20px 0;
        }
        .greeting {
            font-size: 16px;
            color: #333;
            margin-bottom: 20px;
        }
        .info-box {
            background-color: #DCFCE7;
            border-left: 4px solid #10B981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #166534;
        }
        .security-alert {
            background-color: #FEE2E2;
            border-left: 4px solid #EF4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #7F1D1D;
        }
        .security-alert strong {
            color: #DC2626;
        }
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #6EA8FF 0%, #3B6BFF 100%);
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .reset-button:hover {
            opacity: 0.9;
        }
        .reset-link {
            word-break: break-all;
            font-size: 12px;
            color: #3B6BFF;
        }
        .footer-text {
            font-size: 13px;
            color: #666;
            line-height: 1.6;
            margin-top: 25px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
        }
        .footer-text a {
            color: #3B6BFF;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 NIMBUS</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Password Changed</p>
        </div>
        
        <div class="content">
            <div class="success-icon">✅</div>
            
            <div class="greeting">
                <strong>Hi ${userName},</strong>
                <p>Your password has been changed successfully!</p>
            </div>
            
            <div class="info-box">
                <strong>✓ Password Update Confirmed</strong><br>
                If you made this change, you can safely disregard this email and continue using your account.
            </div>
            
            <div class="security-alert">
                <strong>🔒 SECURITY ALERT</strong><br>
                If you didn't make this change and believe your account may have been compromised, please reset your password immediately by clicking the button below.
            </div>
            
            <div style="text-align: center;">
                <a href="${resetLink}" class="reset-button">Reset Password Again</a>
            </div>
            
            <p style="font-size: 13px; color: #666; margin: 15px 0;">
                Or copy this link: <span class="reset-link">${resetLink}</span>
            </p>
            
            <p style="color: #333; line-height: 1.6; margin-top: 25px;">
                If you have any questions or concerns about your account security, please contact our support team at 
                <a href="mailto:support@nimbus.com" style="color: #3B6BFF; text-decoration: none;">support@nimbus.com</a>
            </p>
            
            <div class="footer-text">
                <p style="margin: 0;">Best regards,<br><strong>The Nimbus Security Team</strong></p>
                <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
                    © 2025 Nimbus Project. All rights reserved. | 
                    <a href="#">Privacy Policy</a> | 
                    <a href="#">Terms of Service</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};
