import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import emailRoutes from "./routes/email.routes.js";
import authRoutes from "./routes/auth.routes.js";
import logoRoutes from "./routes/logo.routes.js";
import posterRoutes from "./routes/poster.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (non-blocking - continue if fails)
connectDB();

// Middleware
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/email", emailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/logo", logoRoutes);
app.use("/api/poster", posterRoutes);

// Health Check
app.get("/", (req, res) => {
    res.send("Nimbus Backend is running (ES Modules with Gemini)");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Frontend can access: http://localhost:${PORT}`);
});
