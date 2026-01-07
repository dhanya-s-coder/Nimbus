import { User } from "../models/User.js";
import { OtpToken } from "../models/OtpToken.js";
import { generateTokens, verifyRefreshToken, decodeToken } from "../utils/jwt.js";
import { sendEmail } from "../services/email.service.js";
import {
    generateOtp,
    getOtpExpirationTime,
    isValidOtpFormat,
    generateOtpEmailTemplate,
    generateOtpPlainText,
    generatePasswordChangedEmailTemplate
} from "../utils/otp.js";

const sendOtpHelper = async (email, name, type = 'signup', userData = null) => {
    const otp = generateOtp();
    const expiresAt = getOtpExpirationTime();
    const emailLower = email.toLowerCase();

    await OtpToken.deleteOne({ email: emailLower, type });
    const otpToken = new OtpToken({ email: emailLower, otp, expiresAt, type, userData });
    await otpToken.save();

    const subject = type === 'forgotPassword' ? "Reset Your Password - Nimbus OTP" : "Verify Your Email - Nimbus OTP";
    await sendEmail({
        to: emailLower,
        subject,
        html: generateOtpEmailTemplate(otp, name, type === 'forgotPassword' ? 'Password Reset' : 'signup'),
        text: generateOtpPlainText(otp, name)
    });
    return { email: emailLower, expiresIn: 180 };
};

const verifyOtpHelper = async (email, otp, type) => {
    if (!email || !otp) throw new Error("Email and OTP are required");
    if (!isValidOtpFormat(otp)) throw new Error("OTP must be 6 digits");

    const otpToken = await OtpToken.findOne({ email: email.toLowerCase(), type });
    if (!otpToken) throw new Error("OTP not found or expired");

    const isValid = otpToken.verifyOtp(otp);
    if (!isValid) {
        await otpToken.save();
        throw new Error(`Invalid OTP. ${5 - otpToken.attempts} attempts remaining`);
    }
    return otpToken;
};

export const signupController = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role } = req.body;
        if (!name || !email || !password || !confirmPassword) return res.status(400).json({ error: "All fields are required" });
        if (password !== confirmPassword) return res.status(400).json({ error: "Passwords do not match" });
        if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

        if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: "Email already registered" });

        const result = await sendOtpHelper(email, name, 'signup', { name, password, role: role || "Society Member" });
        res.status(200).json({ message: "OTP sent successfully", ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const verifyOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpToken = await verifyOtpHelper(email, otp, 'signup');
        const { name, password, role } = otpToken.userData;

        const newUser = new User({ name, email: email.toLowerCase(), password, role: role || "Society Member" });
        const { accessToken, refreshToken } = generateTokens(newUser._id.toString(), newUser.email, newUser.role);

        // Cleanup & add token
        newUser.refreshTokens = newUser.refreshTokens.filter(t => { try { verifyRefreshToken(t); return true; } catch { return false; } });
        newUser.addRefreshToken(refreshToken);
        if (newUser.refreshTokens.length > 5) newUser.refreshTokens.shift();

        await newUser.save();
        await OtpToken.deleteOne({ _id: otpToken._id });

        res.status(201).json({ message: "User created successfully", user: { id: newUser._id, name, email: newUser.email, role: newUser.role }, accessToken, refreshToken });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const resendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        const otpToken = await OtpToken.findOne({ email: email.toLowerCase(), type: 'signup' });
        if (!otpToken) return res.status(400).json({ error: "Signup session not found" });

        const result = await sendOtpHelper(email, otpToken.userData.name, 'signup', otpToken.userData);
        res.status(200).json({ message: "New OTP sent", ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const sendForgotPasswordOtpController = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email?.toLowerCase() });
        if (!user) return res.status(404).json({ error: "Account not found" });

        const result = await sendOtpHelper(user.email, user.name, 'forgotPassword');
        res.status(200).json({ message: "Reset OTP sent", ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const verifyForgotPasswordOtpController = async (req, res) => {
    try {
        const otpToken = await verifyOtpHelper(req.body.email, req.body.otp, 'forgotPassword');
        otpToken.isVerified = true;
        otpToken.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await otpToken.save();
        res.status(200).json({ message: "OTP verified", email: req.body.email, otpTokenId: otpToken._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const resetPasswordController = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) return res.status(400).json({ error: "Passwords do not match" });

        const otpToken = await OtpToken.findOne({ email: email.toLowerCase(), otp, type: 'forgotPassword', isVerified: true });
        if (!otpToken || otpToken.isExpired()) return res.status(400).json({ error: "Invalid or expired reset session" });

        const user = await User.findOne({ email: email.toLowerCase() });
        user.password = newPassword;
        user.refreshTokens = [];
        await user.save();
        await OtpToken.deleteOne({ _id: otpToken._id });

        const resetLink = "http://localhost:3000/forgot-password";
        await sendEmail({ to: email, subject: "Password Changed - Nimbus", html: generatePasswordChangedEmailTemplate(user.name, resetLink), text: `Password changed. If not you, reset: ${resetLink}` });

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const resendForgotPasswordOtpController = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email?.toLowerCase() });
        if (!user) return res.status(404).json({ error: "Account not found" });
        const result = await sendOtpHelper(user.email, user.name, 'forgotPassword');
        res.status(200).json({ message: "Reset OTP resent", ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email?.toLowerCase() });
        if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: "Invalid credentials" });

        const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.email, user.role);

        // Cleanup expired tokens & add new one
        user.refreshTokens = user.refreshTokens.filter(t => {
            try { verifyRefreshToken(t); return true; }
            catch { return false; }
        });

        user.addRefreshToken(refreshToken);
        if (user.refreshTokens.length > 5) user.refreshTokens.shift(); // Cap at 5 active sessions

        await user.save();

        res.status(200).json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const refreshTokenController = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.userId);
        if (!user || !user.refreshTokens.includes(refreshToken)) return res.status(401).json({ error: "Invalid refresh token" });

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString(), user.email, user.role);

        user.removeRefreshToken(refreshToken);

        // Cleanup other expired tokens
        user.refreshTokens = user.refreshTokens.filter(t => {
            try { verifyRefreshToken(t); return true; }
            catch { return false; }
        });

        user.addRefreshToken(newRefreshToken);
        if (user.refreshTokens.length > 5) user.refreshTokens.shift();

        await user.save();

        res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        res.status(401).json({ error: "Session expired" });
    }
};

export const logoutController = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ error: "Token required" });

        let userId;
        try {
            userId = verifyRefreshToken(refreshToken).userId;
        } catch {
            userId = decodeToken(refreshToken)?.userId;
        }

        if (userId) await User.updateOne({ _id: userId }, { $pull: { refreshTokens: refreshToken } });
        res.status(200).json({ message: "Logged out" });
    } catch (error) {
        res.status(400).json({ error: "Logout failed" });
    }
};

export const getCurrentUserController = async (req, res) => {
    try {
        const user = await User.findById(req.user?.userId).select("-password -refreshTokens");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: "Error fetching user" });
    }
};
