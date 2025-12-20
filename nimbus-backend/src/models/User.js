import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: "Student/Society Member" },
    refreshTokens: [{ type: String }],
    activities: {
        emailDrafts: [{
            subject: { type: String, required: true },
            prompt: { type: String, required: true },
            content: { type: String, required: true },
            recipient: { type: String },
            createdAt: { type: Date, default: Date.now }
        }],
        sentEmails: [{
            subject: { type: String, required: true },
            prompt: { type: String, required: true },
            content: { type: String, required: true },
            recipient: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }]
    }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
};

// Method to remove a refresh token (logout)
UserSchema.methods.removeRefreshToken = function (token) {
    this.refreshTokens = this.refreshTokens.filter(t => t !== token);
};

// Method to add a refresh token
UserSchema.methods.addRefreshToken = function (token) {
    this.refreshTokens.push(token);
};

export const User = mongoose.model("User", UserSchema);
