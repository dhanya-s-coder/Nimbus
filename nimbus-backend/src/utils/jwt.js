import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

// Generate access token
export const generateAccessToken = (userId, email, role) => {
    return jwt.sign(
        { userId, id: userId, email, role },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
};

// Verify access token
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new Error(`Invalid access token: ${error.message}`);
    }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new Error(`Invalid refresh token: ${error.message}`);
    }
};

// Generate both tokens
export const generateTokens = (userId, email, role) => {
    const accessToken = generateAccessToken(userId, email, role);
    const refreshToken = generateRefreshToken(userId);
    return { accessToken, refreshToken };
};
