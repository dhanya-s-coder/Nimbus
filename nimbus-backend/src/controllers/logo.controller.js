import { HfInference } from "@huggingface/inference";
import { User } from "../models/User.js";
import { getActivityByUserAndType, deleteActivity, saveLogoDraft } from "../services/history.service.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryHelper.js";

const hf = new HfInference(process.env.HF_API_KEY);

export const generateLogoController = async (req, res) => {
    try {
        const { logoName, tagline, category, style, color, iconPreference } = req.body;

        if (!logoName) {
            return res.status(400).json({ success: false, message: "Logo name is required" });
        }

        const prompt = `Generate a clean, professional, and minimal logo for a ${category || 'brand'}.
        Brand name: ${logoName}
        ${tagline ? `Tagline: ${tagline}` : ''}
        Style: ${style || 'Modern'}
        Color preference: ${color || 'AI decides'}
        Icon preference: ${iconPreference || 'geometric shape'}
        The logo should be flat design, centered, and high resolution. 
        Ensure a clean, solid background (white or neutral). 
        Avoid messy text, avoid realistic photo details, avoid mockups.
        Masterpiece, vector style, 4k, crisp edges.`;

        const imageResponse = await hf.textToImage({
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            inputs: prompt,
            parameters: {
                negative_prompt: "blurry, distorted text, low quality, messy, complex, photo, realistic, 3d, gradient background"
            }
        });

        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log("Uploading logo to Cloudinary....");
        const cloudinaryUrl = await uploadBufferToCloudinary(buffer, 'nimbus');
        console.log("Logo uploaded to Cloudinary:", cloudinaryUrl);

        res.json({
            success: true,
            data: {
                image: {
                    url: cloudinaryUrl,
                    mimeType: "image/png"
                }
            }
        });
    } catch (error) {
        console.error("❌ Logo Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate logo", error: error.message });
    }
};

export const saveLogoController = async (req, res) => {
    try {
        const { logoName, formData, generatedImageUrl, status } = req.body;
        const userId = req.user?.userId;
        console.log(generatedImageUrl);

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const draft = await saveLogoDraft(userId, {
            logoName,
            formData,
            generatedImageUrl,
            status: status || 'draft'
        });

        res.status(201).json({
            success: true,
            message: "Logo saved successfully",
            data: draft
        });
    } catch (error) {
        console.error("❌ Error saving logo:", error);
        res.status(500).json({ success: false, message: "Failed to save logo", error: error.message });
    }
};

export const getHistoryController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const activities = await getActivityByUserAndType(userId, 'logo');
        res.json({ success: true, count: activities.length, data: activities });
    } catch (error) {
        console.error("❌ Error fetching logo history:", error);
        res.status(500).json({ success: false, message: "Failed to fetch history", error: error.message });
    }
};

export const deleteActivityController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const result = await deleteActivity(userId, req.params.activityId);

        if (!result) return res.status(404).json({ success: false, message: "Logo not found" });

        res.json({ success: true, message: "Logo deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting logo:", error);
        res.status(500).json({ success: false, message: "Failed to delete logo", error: error.message });
    }
};
