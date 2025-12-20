import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the root of nimbus-backend
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log("---------------------------------------------------");
console.log("📧 Email Service Configuration:");
console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? process.env.EMAIL_USER : "MISSING"}`);
console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? "LOADED" : "MISSING"}`);
console.log("---------------------------------------------------");

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
