export const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
};
export const getOtpExpirationTime = () => {
    const now = new Date();
    return new Date(now.getTime() + 180000);
};
export const getResendEnabledTime = () => {
    const now = new Date();
    return new Date(now.getTime() + 60000);
};

export const isValidOtpFormat = (otp) => {
    return /^\d{6}$/.test(otp);
};

export const generateOtpEmailTemplate = (otp, userName, type = 'Signup') => {
    const title = type === 'Password Reset' ? 'Reset Your Password' : 'Email Verification';
    const message = type === 'Password Reset'
        ? 'Forgot your password? Use the code below to reset it.'
        : 'Welcome to Nimbus! Use the code below to verify your email.';

    return `
<div style="font-family: sans-serif; max-width: 500px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color: #333; border-bottom: 2px solid #3B6BFF; padding-bottom: 10px;">Nimbus ${title}</h2>
    <p>Hi ${userName},</p>
    <p>${message}</p>
    <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 4px;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #3B6BFF;">${otp}</span>
    </div>
    <p style="font-size: 13px; color: #666;">This code expires in 3 minutes.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #999;">If you didn't request this, ignore this email.</p>
</div>
    `;
};

export const generateOtpPlainText = (otp, userName) => {
    return `Hi ${userName},\n\nYour Nimbus verification code is: ${otp}\n\nThis expires in 3 minutes.`;
};

export const generatePasswordChangedPlainText = (userName, resetLink) => {
    return `Hi ${userName},\n\nYour password has been changed successfully. If this wasn't you, reset it here: ${resetLink}`;
};

export const generatePasswordChangedEmailTemplate = (userName, resetLink) => {
    return `
<div style="font-family: sans-serif; max-width: 500px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color: #333; border-bottom: 2px solid #10B981; padding-bottom: 10px;">Password Changed</h2>
    <p>Hi ${userName},</p>
    <p>Your password has been changed successfully.</p>
    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #EF4444; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px;"><strong>Security Alert:</strong> If you didn't do this, reset your password now:</p>
        <p style="margin: 10px 0 0 0;"><a href="${resetLink}" style="color: #3B6BFF;">Reset Password Again</a></p>
    </div>
    <p style="font-size: 12px; color: #999;">Best regards,<br>The Nimbus Team</p>
</div>
    `;
};
