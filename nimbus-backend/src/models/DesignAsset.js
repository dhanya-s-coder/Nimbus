import mongoose from "mongoose";

const DesignAssetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    isSystemTemplate: {
        type: Boolean,
        default: false
    },
    cloudinaryUrl: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["poster", "logo"],
        required: true
    },
    templateType: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: ""
    },
    prompt: {
        type: String,
        default: ""
    },
    embedding: {
        type: [Number],
        default: []
    }
}, { timestamps: true });

export const DesignAsset = mongoose.model("DesignAsset", DesignAssetSchema);
