import { User } from "../models/User.js";
import { OtpToken } from "../models/OtpToken.js";
import { generateTokens, verifyRefreshToken } from "../utils/jwt.js";
import { sendEmail } from "../services/email.service.js";
import {
    generateOtp,
    getOtpExpirationTime,
    isValidOtpFormat,
    generateOtpEmailTemplate,
    generateOtpPlainText,
    generatePasswordChangedEmailTemplate,
    generatePasswordChangedPlainText
} from "../utils/otp.js";

// =========================
// OTP-BASED SIGNUP FLOW
// =========================

// Step 1: Send OTP during Signup
export const signupController = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        const emailLower = email.toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({ email: emailLower });
        if (existingUser) {
            return res.status(409).json({ error: "Email already registered" });
        }

        // Generate OTP
        const otp = generateOtp();
        const expiresAt = getOtpExpirationTime();

        // Delete any existing OTP for this email (rate limiting)
        await OtpToken.deleteOne({ email: emailLower });

        // Create OTP document
        const otpToken = new OtpToken({
            email: emailLower,
            otp,
            expiresAt,
            userData: {
                name,
                password,
                confirmPassword,
                role: role || "User"
            }
        });

        await otpToken.save();

        // Send OTP email
        const htmlContent = generateOtpEmailTemplate(otp, name);
        const plainTextContent = generateOtpPlainText(otp, name);

        await sendEmail({
            to: emailLower,
            subject: "Verify Your Email - Nimbus OTP",
            html: htmlContent,
            text: plainTextContent
        });

        res.status(200).json({
            message: "OTP sent successfully to your email",
            email: emailLower,
            expiresIn: 180, // 3 minutes
            resendAfter: 60 // Resend button enabled after 1 minute
        });
    } catch (error) {
        console.error("Signup OTP Error:", error.message);
        res.status(500).json({ error: error.message || "Failed to send OTP" });
    }
};

// Step 2: Verify OTP and Create User (Auto-login)
export const verifyOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validation
        if (!email || !otp) {
            return res.status(400).json({ error: "Email and OTP are required" });
        }

        if (!isValidOtpFormat(otp)) {
            return res.status(400).json({ error: "OTP must be 6 digits" });
        }

        const emailLower = email.toLowerCase();

        // Find OTP document
        const otpToken = await OtpToken.findOne({ email: emailLower });

        if (!otpToken) {
            return res.status(400).json({ error: "OTP not found or expired. Please request a new one." });
        }

        // Verify OTP
        try {
            const isValid = otpToken.verifyOtp(otp);
            if (!isValid) {
                await otpToken.save();
                const remaining = otpToken.getRemainingTime();
                return res.status(400).json({
                    error: "Invalid OTP. Please try again.",
                    attemptsRemaining: 5 - otpToken.attempts,
                    expiresIn: remaining
                });
            }
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }

        // OTP verified - Create user
        const { name, password, role } = otpToken.userData;

        const newUser = new User({
            name,
            email: emailLower,
            password,
            role: role || "User"
        });

        await newUser.save();

        // Generate tokens for auto-login
        const { accessToken, refreshToken } = generateTokens(
            newUser._id.toString(),
            newUser.email,
            newUser.role
        );

        // Save refresh token
        newUser.addRefreshToken(refreshToken);
        await newUser.save();

        // Delete OTP after successful verification
        await OtpToken.deleteOne({ _id: otpToken._id });

        res.status(201).json({
            message: "Email verified and account created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error("Verify OTP Error:", error.message);
        res.status(500).json({ error: error.message || "OTP verification failed" });
    }
};

// Step 3: Resend OTP
export const resendOtpController = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const emailLower = email.toLowerCase();

        // Find existing OTP
        const otpToken = await OtpToken.findOne({ email: emailLower });

        if (!otpToken) {
            return res.status(400).json({ error: "No signup request found for this email. Please signup again." });
        }

        // Check if already verified
        if (otpToken.isVerified) {
            return res.status(400).json({ error: "This email is already verified" });
        }

        // Generate new OTP
        const newOtp = generateOtp();
        const newExpiresAt = getOtpExpirationTime();

        otpToken.otp = newOtp;
        otpToken.expiresAt = newExpiresAt;
        otpToken.attempts = 0;
        await otpToken.save();

        // Send new OTP email
        const { name } = otpToken.userData;
        const htmlContent = generateOtpEmailTemplate(newOtp, name);
        const plainTextContent = generateOtpPlainText(newOtp, name);

        await sendEmail({
            to: emailLower,
            subject: "Your New OTP - Nimbus Email Verification",
            html: htmlContent,
            text: plainTextContent
        });

        res.status(200).json({
            message: "New OTP sent to your email",
            email: emailLower,
            expiresIn: 180, // 3 minutes
            resendAfter: 60 // Resend button enabled after 1 minute
        });
    } catch (error) {
        console.error("Resend OTP Error:", error.message);
        res.status(500).json({ error: error.message || "Failed to resend OTP" });
    }
};

// =========================
// OTP-BASED FORGOT PASSWORD FLOW
// =========================

// Step 1: Send OTP for forgot password
export const sendForgotPasswordOtpController = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const emailLower = email.toLowerCase();

        // Check if user exists
        const user = await User.findOne({ email: emailLower });
        if (!user) {
            return res.status(404).json({ error: "No account found with this email" });
        }

        // Generate OTP
        const otp = generateOtp();
        const expiresAt = getOtpExpirationTime();

        // Delete any existing OTP for this email
        await OtpToken.deleteOne({ email: emailLower, type: 'forgotPassword' });

        // Create OTP document for forgot password
        const otpToken = new OtpToken({
            email: emailLower,
            otp,
            type: 'forgotPassword',
            expiresAt
        });

        await otpToken.save();

        // Send OTP email
        const htmlContent = generateOtpEmailTemplate(otp, user.name, 'Password Reset');
        const plainTextContent = generateOtpPlainText(otp, user.name);

        await sendEmail({
            to: emailLower,
            subject: "Reset Your Password - Nimbus OTP",
            html: htmlContent,
            text: plainTextContent
        });

        res.status(200).json({
            message: "OTP sent successfully to your email",
            email: emailLower,
            expiresIn: 180,
            resendAfter: 60
        });
    } catch (error) {
        console.error("Send Forgot Password OTP Error:", error.message);
        res.status(500).json({ error: error.message || "Failed to send OTP" });
    }
};

// Step 2: Verify OTP for forgot password
export const verifyForgotPasswordOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validation
        if (!email || !otp) {
            return res.status(400).json({ error: "Email and OTP are required" });
        }

        if (!isValidOtpFormat(otp)) {
            return res.status(400).json({ error: "OTP must be 6 digits" });
        }

        const emailLower = email.toLowerCase();

        // Find OTP document
        const otpToken = await OtpToken.findOne({ email: emailLower, type: 'forgotPassword' });

        if (!otpToken) {
            return res.status(400).json({ error: "OTP not found or expired. Please request a new one." });
        }

        // Verify OTP
        try {
            const isValid = otpToken.verifyOtp(otp);
            if (!isValid) {
                await otpToken.save();
                const remaining = otpToken.getRemainingTime();
                return res.status(400).json({
                    error: "Invalid OTP. Please try again.",
                    attemptsRemaining: 5 - otpToken.attempts,
                    expiresIn: remaining
                });
            }

            // Save the verified state AND extend expiration to allow time for password reset
            otpToken.isVerified = true;
            otpToken.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Add 5 minutes
            await otpToken.save();
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            message: "OTP verified successfully",
            email: emailLower,
            otpTokenId: otpToken._id.toString()
        });
    } catch (error) {
        console.error("Verify Forgot Password OTP Error:", error.message);
        res.status(500).json({ error: error.message || "OTP verification failed" });
    }
};

// Step 3: Reset Password
export const resetPasswordController = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        // Validation
        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        const emailLower = email.toLowerCase();

        // Find OTP document
        const otpToken = await OtpToken.findOne({ email: emailLower, type: 'forgotPassword' });

        if (!otpToken) {
            return res.status(400).json({ error: "Invalid request. Please request a new password reset." });
        }

        // Security check: Ensure the OTP matches
        if (otpToken.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP provided." });
        }

        if (!otpToken.isVerified) {
            return res.status(400).json({ error: "OTP not verified. Please verify OTP first." });
        }

        if (otpToken.isExpired()) {
            return res.status(400).json({ error: "OTP expired. Please request a new password reset." });
        }

        // Find user
        const user = await User.findOne({ email: emailLower });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Delete OTP after successful password reset
        await OtpToken.deleteOne({ _id: otpToken._id });

        // Send confirmation email with security link
        const resetLink = "http://localhost:3000/forgot-password";
        const htmlContent = generatePasswordChangedEmailTemplate(user.name, resetLink);
        const plainTextContent = `Your password has been changed successfully. If this wasn't you, please reset your password: ${resetLink}`;

        await sendEmail({
            to: emailLower,
            subject: "Password Changed Successfully - Nimbus",
            html: htmlContent,
            text: plainTextContent
        });

        res.status(200).json({
            message: "Password reset successfully. Confirmation email sent.",
            email: emailLower
        });
    } catch (error) {
        console.error("Reset Password Error:", error.message);
        res.status(500).json({ error: error.message || "Password reset failed" });
    }
};

// Resend OTP for Forgot Password
export const resendForgotPasswordOtpController = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const emailLower = email.toLowerCase();

        // Find existing OTP
        const otpToken = await OtpToken.findOne({ email: emailLower, type: 'forgotPassword' });

        if (!otpToken) {
            return res.status(400).json({ error: "No password reset request found for this email." });
        }

        // Generate new OTP
        const newOtp = generateOtp();
        const newExpiresAt = getOtpExpirationTime();

        otpToken.otp = newOtp;
        otpToken.expiresAt = newExpiresAt;
        otpToken.attempts = 0;
        otpToken.isVerified = false;
        await otpToken.save();

        // Find user for email
        const user = await User.findOne({ email: emailLower });

        // Send new OTP email
        const htmlContent = generateOtpEmailTemplate(newOtp, user?.name || 'User', 'Password Reset');
        const plainTextContent = generateOtpPlainText(newOtp, user?.name || 'User');

        await sendEmail({
            to: emailLower,
            subject: "Your New OTP - Nimbus Password Reset",
            html: htmlContent,
            text: plainTextContent
        });

        res.status(200).json({
            message: "New OTP sent to your email",
            email: emailLower,
            expiresIn: 180,
            resendAfter: 60
        });
    } catch (error) {
        console.error("Resend Forgot Password OTP Error:", error.message);
        res.status(500).json({ error: error.message || "Failed to resend OTP" });
    }
};

// =========================
// TRADITIONAL LOGIN
// =========================

// Login Controller
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(
            user._id.toString(),
            user.email,
            user.role
        );

        // Save refresh token to database
        user.addRefreshToken(refreshToken);
        await user.save();

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ error: error.message || "Login failed" });
    }
};

// =========================
// TOKEN MANAGEMENT
// =========================

// Refresh Token Controller
export const refreshTokenController = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token is required" });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user || !user.refreshTokens.includes(refreshToken)) {
            return res.status(401).json({ error: "Invalid or expired refresh token" });
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(
            user._id.toString(),
            user.email,
            user.role
        );

        // Replace old refresh token with new one
        user.removeRefreshToken(refreshToken);
        user.addRefreshToken(newRefreshToken);
        await user.save();

        res.status(200).json({
            message: "Token refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error("Refresh Token Error:", error.message);
        res.status(401).json({ error: error.message || "Failed to refresh token" });
    }
};

// Logout Controller
export const logoutController = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token is required" });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user and remove refresh token
        const user = await User.findById(decoded.userId);
        if (user) {
            user.removeRefreshToken(refreshToken);
            await user.save();
        }

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error.message);
        res.status(400).json({ error: error.message || "Logout failed" });
    }
};

// =========================
// USER PROFILE
// =========================

// Get current user (protected route)
export const getCurrentUserController = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const user = await User.findById(userId).select("-password -refreshTokens");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Get User Error:", error.message);
        res.status(500).json({ error: error.message || "Failed to get user" });
    }
};
