import mongoose from "mongoose";

const OtpTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    otp: {
        type: String,
        required: true,
        length: 6
    },
    type: {
        type: String,
        enum: ['signup', 'forgotPassword'],
        default: 'signup'
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 240 } // Auto-delete 4 minutes after expiration (OTP valid for 3 min + buffer)
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0,
        max: 5
    },
    userData: {
        name: String,
        password: String,
        role: String,
        confirmPassword: String
    },
    resetPasswordData: {
        newPassword: String,
        confirmPassword: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Method to verify OTP
OtpTokenSchema.methods.verifyOtp = function (inputOtp) {
    if (this.isVerified) {
        throw new Error("OTP already verified");
    }

    if (this.attempts >= 5) {
        throw new Error("Maximum OTP verification attempts exceeded");
    }

    if (new Date() > this.expiresAt) {
        throw new Error("OTP has expired");
    }

    if (this.otp !== inputOtp) {
        this.attempts += 1;
        return false;
    }

    this.isVerified = true;
    return true;
};

// Method to check if OTP is expired
OtpTokenSchema.methods.isExpired = function () {
    return new Date() > this.expiresAt;
};

// Method to get remaining time in seconds
OtpTokenSchema.methods.getRemainingTime = function () {
    const remaining = this.expiresAt - new Date();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
};

export const OtpToken = mongoose.model("OtpToken", OtpTokenSchema);
