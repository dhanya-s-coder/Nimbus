import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

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
