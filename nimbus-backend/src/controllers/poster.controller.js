import { HfInference } from "@huggingface/inference";
import { User } from "../models/User.js";
import { savePosterDraft, getActivityByUserAndType, deleteActivity } from "../services/history.service.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryHelper.js";

const TEMPLATE_PROMPTS = {
    academic: `A high-quality, professional academic seminar poster. Masterpiece, ultra-detailed, 8k resolution.
- Style: Clean, formal, institutional graphic design.
- Background: Minimalist white or very light gray with subtle professional geometric accents.
- Layout: Structured grid, clear visual hierarchy, professional typography.
- Colors: Sophisticated navy blue and charcoal gray accents.
- Atmosphere: Intellectual, serious, and organized.`,

    recruitment: `A premium corporate recruitment and hiring poster. Masterpiece, sharp focus, trend-setting design.
- Style: Modern business aesthetic, clean corporate graphic design.
- Background: Professional blurred office background or elegant solid corporate blue.
- Layout: Bold call-to-action, prominent headings, clean spacing.
- Colors: Energetic mix of professional blue, white, and subtle gold accents.
- Atmosphere: Ambitious, welcoming, and high-end.`,

    event: `A vibrant and stunning event festival poster. High-energy, colorful, masterpiece level design.
- Style: Creative, dynamic, and modern graphic design.
- Background: Energetic abstract patterns, vibrant gradients, or festive atmosphere.
- Layout: Exciting typography, overlapping elements, clear time and venue details.
- Colors: Rich, saturated palette (e.g., sunset oranges, deep purples, and electric blues).
- Atmosphere: Celebratory, exciting, and highly engaging.`,

    hackathon: `A futuristic, high-tech hackathon poster. Cyberpunk aesthetic, neon lighting, ultra-detailed 8k.
- Style: Sci-fi tech design, glowing circuits, digital network visuals.
- Background: Deep dark navy or black with glowing neon cyan and magenta accents.
- Layout: Modern tech fonts, futuristic data overlays, crisp sharp lines.
- Colors: Electric blue, neon green, and ultraviolet highlights.
- Atmosphere: Innovative, cutting-edge, and high-speed.`,

    announcement: `A clean, authoritative official announcement poster. High resolution, clear and legible.
- Style: Professional signage, Swiss-style graphic design.
- Background: High-contrast solid color or subtle paper texture.
- Layout: Grid-based, bold headlines, easy-to-read body text.
- Colors: High-contrast (e.g., Red/White or Black/Teal).
- Atmosphere: Urgent, informative, and official.`
};

const buildUserPrompt = (templateType, formData) => {
    if (!formData || typeof formData !== "object") {
        throw new Error("Invalid formData provided");
    }

    let prompt = `Include the following textual content on the poster:\n`;

    for (const [key, value] of Object.entries(formData)) {
        if (value && String(value).trim() !== "") {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            prompt += `- ${label}: ${String(value).trim()}\n`;
        }
    }

    prompt += `\nTechnical requirements: High-quality professional graphic design, sharp text rendering (simulated), balanced composition, rule of thirds, photorealistic quality.`;

    return prompt;
};

// const hf = new InferenceClient(process.env.HF_API_KEY);
const hf = new HfInference(process.env.HF_API_KEY);

export const generatePosterController = async (req, res) => {
    try {
        const { templateType, formData } = req.body;

        if (!templateType || !formData) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (!TEMPLATE_PROMPTS[templateType]) {
            return res.status(400).json({ success: false, message: "Invalid template type" });
        }

        const systemPrompt = TEMPLATE_PROMPTS[templateType];
        const userPrompt = buildUserPrompt(templateType, formData);
        const fullPrompt = `${systemPrompt}\n\nDetails:\n${userPrompt}`;

        const imageBlob = await hf.textToImage({
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            inputs: fullPrompt,
            parameters: {
                negative_prompt: "ugly, blurry, low quality, distorted, extra limbs, bad anatomy, grainy, low resolution, watermark, text, signature, logo, deformed, amateur, messy, tacky, kitsch, overexposed, underexposed, low contrast, pixelated",
                num_inference_steps: 30,
                guidance_scale: 7.5,
            },
        });

        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        console.log("Uploading poster to Cloudinary...");
        const cloudinaryUrl = await uploadBufferToCloudinary(buffer, 'nimbus');
        console.log("Poster uploaded to Cloudinary:", cloudinaryUrl);

        res.json({
            success: true,
            data: {
                image: {
                    mimeType: imageBlob.type || "image/jpeg",
                    url: cloudinaryUrl
                }
            }
        });
    } catch (error) {
        console.error("❌ Poster Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate poster", error: error.message });
    }
};

export const savePosterController = async (req, res) => {
    try {
        const { templateType, formData, generatedImageUrl, status } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const draft = await savePosterDraft(userId, {
            templateType,
            formData,
            generatedImageUrl: generatedImageUrl || null,
            status: status || 'draft'
        });

        res.status(201).json({
            success: true,
            message: "Poster saved successfully",
            data: draft
        });
    } catch (error) {
        console.error("❌ Error saving poster:", error);
        res.status(500).json({ success: false, message: "Failed to save poster", error: error.message });
    }
};

export const getHistoryController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const activities = await getActivityByUserAndType(userId, 'poster');
        res.json({ success: true, count: activities.length, data: activities });
    } catch (error) {
        console.error("❌ Error fetching poster history:", error);
        res.status(500).json({ success: false, message: "Failed to fetch history", error: error.message });
    }
};

export const deleteActivityController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const result = await deleteActivity(userId, req.params.activityId);

        if (!result) return res.status(404).json({ success: false, message: "Poster not found" });

        res.json({ success: true, message: "Poster deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting poster:", error);
        res.status(500).json({ success: false, message: "Failed to delete poster", error: error.message });
    }
};