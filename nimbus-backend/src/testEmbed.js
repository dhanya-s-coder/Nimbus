import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
    try {
        console.log("Testing text-embedding-004...");
        const result = await ai.models.embedContent({
            model: "text-embedding-004",
            contents: "test text"
        });
        console.log("004 Success! Length:", result.embeddings[0].values.length);
    } catch (e) {
        console.error("004 Failed:", e.message);
    }
}
test();
