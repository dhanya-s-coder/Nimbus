import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Authorization header missing or invalid" });
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix

        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        res.status(401).json({
            error: "Authentication failed",
            details: error.message,
            reason: error.message.includes("expired") ? "TOKEN_EXPIRED" : "TOKEN_INVALID"
        });
    }
};
