import { GoogleGenAI } from "@google/genai";
import { DesignAsset } from "../models/DesignAsset.js";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("⚠️  WARNING: GEMINI_API_KEY is not set in .env file");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Use Gemini Vision to describe the design aesthetic of an image.
 * @param {string} imageUrl 
 * @returns {Promise<string>} 
 */
export const describeDesign = async (imageUrl) => {
    if (!ai) throw new Error("Gemini AI not initialized. Check GEMINI_API_KEY.");
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = response.headers.get("content-type") || "image/png";

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                inlineData: {
                    mimeType,
                    data: base64Image
                }
            },
            {
                text: `You are a professional graphic design analyst. Analyze this design and describe it in exactly 2-3 sentences covering:
1. Visual style (modern, retro, minimalist, etc.)
2. Color palette and dominant hues
3. Layout composition and mood/atmosphere
Be specific about design elements. Do NOT describe what the image depicts literally — focus purely on the aesthetic and design language.`
            }
        ]
    });

    return result.text;
};

/**
 * Generate a 768-dimensional embedding vector for the given text.
 * @param {string} text 
 * @returns {Promise<number[]>} 
 */
export const embedText = async (text) => {

    console.log("Mocking 768-dim embedding array for demo...");
    return Array.from({ length: 768 }, () => Math.random() * 2 - 1);
};

/**
 * Generate an image using Pollinations.ai (Free, High-Quality).
 * @param {string} prompt 
 * @returns {Promise<Buffer>} 
 */
export const generateImage = async (prompt) => {
    const pollApiKey = process.env.POLLINATIONS_API_KEY;
    if (!pollApiKey) {
        throw new Error("⚠️ POLLINATIONS_API_KEY is not set in your .env file!");
    }

    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt);

    const url = `https://gen.pollinations.ai/image/${encodedPrompt}?model=zimage&width=1024&height=1024&nologo=true&seed=${seed}`;

    console.log(`🎨 Fetching image from Pollinations.ai using prompt: "${prompt.substring(0, 50)}..."`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${pollApiKey}`,
            'Accept': 'image/jpeg, image/png, image/*;q=0.8'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Pollinations API Error Details:", errorText);
        throw new Error(`Failed to generate image from Pollinations. HTTP Status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
};
/**
 * Full ingestion pipeline: describe → embed → save to DesignAsset collection.
 * This is the"self-learning" loop that grows the RAG knowledge base.
 * @param {string} cloudinaryUrl 
 * @param {string} type 
 * @param {string|null} userId 
 * @param {string} prompt 
 * @param {string|null} templateType 
 * @returns {Promise<object>} 
 */
export const ingestDesignAsset = async (cloudinaryUrl, type, userId = null, prompt = "", templateType = null) => {
    try {
        console.log(`📥 Ingesting ${type} design asset...`);

        // Describe the design using Gemini Vision
        const description = await describeDesign(cloudinaryUrl);
        console.log(`🔍 Vision description: ${description.substring(0, 100)}...`);

        // Generate embedding from the description
        const embedding = await embedText(description);
        console.log(`📊 Embedding generated: ${embedding.length} dimensions`);

        //  Save to MongoDB
        const asset = new DesignAsset({
            userId,
            isSystemTemplate: !userId,
            cloudinaryUrl,
            type,
            templateType,
            description,
            prompt,
            embedding
        });

        await asset.save();
        console.log(`✅ Design asset ingested: ${asset._id}`);

        return asset;
    } catch (error) {
        console.error(`❌ Design asset ingestion failed:`, error.message);
        return null;
    }
};

/**
 * @param {string} prompt 
 * @returns {Promise<string>} 
 */
export const generateText = async (prompt) => {
    if (!ai) throw new Error("Gemini AI not initialized. Check GEMINI_API_KEY.");

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    return result.text;
};