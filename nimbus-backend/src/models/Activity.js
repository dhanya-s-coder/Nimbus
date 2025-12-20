import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['email', 'poster', 'logo'],
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'generated'],
        default: 'generated',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    prompt: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    recipient: {
        type: String
    },
    subject: {
        type: String
    },
    metadata: {
        style: String,
        color: String,
        // Additional fields for posters, logos, etc.
    }
}, { timestamps: true });

// Index for efficient user queries
ActivitySchema.index({ user_id: 1, createdAt: -1 });
ActivitySchema.index({ user_id: 1, type: 1 });

export const Activity = mongoose.model("Activity", ActivitySchema);
