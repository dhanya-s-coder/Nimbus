import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: "Society Member" },
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
        }],
        posterDrafts: [{
            templateType: { type: String },
            formData: { type: mongoose.Schema.Types.Mixed },
            generatedImageUrl: { type: String },
            status: { type: String, enum: ['draft', 'final'], default: 'draft' },
            createdAt: { type: Date, default: Date.now }
        }],
        logoDrafts: [{
            logoName: { type: String },
            formData: { type: mongoose.Schema.Types.Mixed },
            generatedImageUrl: { type: String },
            status: { type: String, enum: ['draft', 'final'], default: 'draft' },
            createdAt: { type: Date, default: Date.now }
        }],
        reports: [{
            reportType: { type: String, required: true },
            title: { type: String, required: true },
            rawInput: { type: String },
            content: { type: String, required: true },
            status: { type: String, enum: ['draft', 'final'], default: 'final' },
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

UserSchema.methods.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
};

UserSchema.methods.removeRefreshToken = function (token) {
    this.refreshTokens = this.refreshTokens.filter(t => t !== token);
};

UserSchema.methods.addRefreshToken = function (token) {
    this.refreshTokens.push(token);
};

export const User = mongoose.model("User", UserSchema);
