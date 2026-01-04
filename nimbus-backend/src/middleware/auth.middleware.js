import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                error: "Invalid or missing authorization header"
            });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                error: "Token is missing"
            });
        }

        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ Auth Middleware Error:", error.message);
        res.status(401).json({
            success: false,
            message: "Unauthorized",
            error: error.message.includes("expired") ? "Token has expired" : "Invalid token"
        });
    }
};
