import { HfInference } from "@huggingface/inference";
import { User } from "../models/User.js";
import { savePosterDraft, getActivityByUserAndType, deleteActivity } from "../services/history.service.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryHelper.js";

const buildBackgroundPrompt = (eventName = "", category = "", theme = "") => {
    const n = (eventName + " " + category + " " + theme).toLowerCase();

    let stylePrompt = "";

    if (n.includes("hack") || n.includes("code") || n.includes("tech")
        || n.includes("program") || n.includes("competitive"))
        stylePrompt = `dark cyberpunk cityscape, deep teal and electric blue 
    gradient, glowing circuit board patterns, binary code atmosphere, 
    neon light trails, futuristic tech aesthetic, dramatic lighting, 
    ultra detailed 4k`;

    else if (n.includes("recruit") || n.includes("career") || n.includes("job")
        || n.includes("hiring") || n.includes("placement"))
        stylePrompt = `sleek corporate abstract background, deep navy blue 
    and gold gradient, geometric diamond shapes, professional luxury, 
    soft bokeh lights, modern minimalist architecture, premium feel, 4k`;

    else if (n.includes("cultural") || n.includes("fest") || n.includes("music")
        || n.includes("dance") || n.includes("art") || n.includes("drama"))
        stylePrompt = `vibrant festival atmosphere, rich jewel tone gradients,
    purple magenta and gold bokeh, celebratory confetti blur, 
    dynamic colorful energy, stage lights, euphoric atmosphere, 4k`;

    else if (n.includes("sport") || n.includes("game") || n.includes("tournament")
        || n.includes("championship") || n.includes("match"))
        stylePrompt = `dramatic stadium under floodlights, bold red and orange 
    gradient, dynamic motion blur streaks, epic competitive atmosphere, 
    volumetric god rays, high energy, 4k`;

    else if (n.includes("workshop") || n.includes("seminar") || n.includes("talk")
        || n.includes("lecture") || n.includes("session") || n.includes("pitch"))
        stylePrompt = `elegant minimal abstract background, soft indigo and 
    violet gradient, geometric flowing shapes, clean professional, 
    subtle light beam rays, knowledge and growth theme, 4k`;

    else if (n.includes("social") || n.includes("networking") || n.includes("meetup")
        || n.includes("community") || n.includes("connect"))
        stylePrompt = `warm modern interior atmosphere, golden hour light, 
    soft amber and cream gradients, subtle bokeh, welcoming professional 
    networking vibe, premium lounge feel, 4k`;

    else
        stylePrompt = `beautiful abstract gradient background, deep midnight 
    blue and royal purple, smooth flowing light shapes, modern premium, 
    subtle geometric patterns, sophisticated, 4k`;

    return `${stylePrompt}, 
    poster background template only, 
    empty clean composition with space for text overlay,
    NO text, NO letters, NO words, NO typography, NO watermarks,
    NO people, NO faces, NO hands, NO logos,
    vertical portrait orientation, 4:5 aspect ratio`;
};

const NEGATIVE_PROMPT = `text, letters, words, typography, watermark, 
signature, title, heading, caption, numbers, fonts, alphabet, writing, 
labels, stamps, banners, people, faces, hands, bodies, portraits,
ugly, blurry, low quality, distorted, noisy, grainy, overexposed,
underexposed, bad composition, cluttered, messy`;

// const hf = new InferenceClient(process.env.HF_API_KEY);
const hf = new HfInference(process.env.HF_API_KEY);

export const generatePosterController = async (req, res) => {
    try {
        const { eventName, category, theme, formData } = req.body;

        const finalEventName = eventName || (formData && formData.eventName) || "";
        const finalCategory = category || (formData && formData.eventType) || (formData && formData.category) || (req.body.templateType) || "";
        const finalTheme = theme || (formData && formData.theme) || "";

        const generatedPrompt = buildBackgroundPrompt(finalEventName, finalCategory, finalTheme);
        console.log("🎨 Generated SDXL Prompt:", generatedPrompt);

        const imageBlob = await hf.textToImage({
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            inputs: generatedPrompt,
            parameters: {
                negative_prompt: NEGATIVE_PROMPT,
                num_inference_steps: 35,
                guidance_scale: 8.0,
                width: 832,
                height: 1040
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