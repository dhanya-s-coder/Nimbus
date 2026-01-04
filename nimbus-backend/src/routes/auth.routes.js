import express from "express";
import { 
    loginController, 
    signupController,
    verifyOtpController,
    resendOtpController,
    sendForgotPasswordOtpController,
    verifyForgotPasswordOtpController,
    resetPasswordController,
    resendForgotPasswordOtpController,
    refreshTokenController,
    logoutController,
    getCurrentUserController
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes - Authentication
router.post("/signup", signupController);           // Step 1: Send OTP
router.post("/verify-otp", verifyOtpController);   // Step 2: Verify OTP and create user
router.post("/resend-otp", resendOtpController);   // Resend OTP

router.post("/forgot-password/send-otp", sendForgotPasswordOtpController);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtpController);
router.post("/forgot-password/reset", resetPasswordController);
router.post("/forgot-password/resend-otp", resendForgotPasswordOtpController); 

router.post("/login", loginController);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", logoutController);

// Protected routes 
router.get("/me", authMiddleware, getCurrentUserController);

export default router;
