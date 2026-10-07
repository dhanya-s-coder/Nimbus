import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import emailRoutes from "./routes/email.routes.js";
import authRoutes from "./routes/auth.routes.js";
import logoRoutes from "./routes/logo.routes.js";
import posterRoutes from "./routes/poster.routes.js";
import reportRoutes from "./routes/report.routes.js";
import { ragRouter, generateRouter } from "./routes/rag.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
    origin: (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001,http://localhost:3005").split(",").map((o) => o.trim()),
    credentials: true
}));
// Increased limit to handle large base64 encoded poster images (~1-2MB each)
// TODO: Consider storing images in a cloud bucket (S3/Cloudinary) and saving only URLs in DB for better performance
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Paid/AI endpoints: throttle per client (RATE_LIMIT_PER_MIN, default 30)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_PER_MIN) || 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please slow down." },
});
app.use(["/api/rag", "/api/generate"], aiLimiter);
app.use(["/api/poster/generate", "/api/logo/generate", "/api/report/generate", "/api/email/generate"], aiLimiter);

// Routes
app.use("/api/email", emailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/logo", logoRoutes);
app.use("/api/poster", posterRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/rag", ragRouter);
app.use("/api/generate", generateRouter);

// Health Check
app.get("/", (req, res) => {
    res.send("Nimbus Backend is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Frontend can access: http://localhost:${PORT}`);
});
