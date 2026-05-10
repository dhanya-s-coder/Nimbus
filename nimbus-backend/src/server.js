import 'dotenv/config';
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import emailRoutes from "./routes/email.routes.js";
import authRoutes from "./routes/auth.routes.js";
import logoRoutes from "./routes/logo.routes.js";
import posterRoutes from "./routes/poster.routes.js";
import reportRoutes from "./routes/report.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// Middleware
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("/api/email", emailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/logo", logoRoutes);
app.use("/api/poster", posterRoutes);
app.use("/api/report", reportRoutes);

// Health Check
app.get("/", (req, res) => {
    res.send("Nimbus Backend is running");
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
