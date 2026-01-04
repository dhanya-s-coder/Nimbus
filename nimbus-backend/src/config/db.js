import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Loaded" : "❌ Not loaded");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.warn("⚠️  MongoDB Connection Error:", err.message);
        console.warn("⚠️  Server will continue without database persistence");
    }
};
