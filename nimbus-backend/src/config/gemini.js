import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("⚠️  WARNING: GEMINI_API_KEY is not set in .env file");
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;
