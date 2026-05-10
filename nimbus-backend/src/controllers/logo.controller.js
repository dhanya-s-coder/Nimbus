import { DesignAsset } from "../models/DesignAsset.js";
import { getActivityByUserAndType, deleteActivity, saveLogoDraft } from "../services/history.service.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryHelper.js";
import { embedText, generateImage, ingestDesignAsset } from "../services/gemini.service.js";

/**
 * Build a natural-language prompt from the logo form inputs.
 */
const buildLogoPrompt = (logoName, formData) => {
    const { tagline, category, style, color, iconPreference } = formData || {};
    
    let prompt = `A clean, professional logo for "${logoName}"`;
    
    const parts = [];
    if (category) parts.push(`in the ${category} category`);
    if (style) parts.push(`with a ${style} style`);
    if (color && color !== "Auto") parts.push(`using a ${color} color palette`);
    if (tagline) parts.push(`with the tagline "${tagline}"`);
    if (iconPreference) parts.push(`incorporating a ${iconPreference} icon`);
    
    if (parts.length > 0) {
        prompt += ` ${parts.join(", ")}`;
    }

    return prompt;
};

export const generateLogoController = async (req, res) => {
    try {
        const { logoName, tagline, category, style, color, iconPreference } = req.body;

        if (!logoName) {
            return res.status(400).json({ success: false, message: "Logo name is required" });
        }

        const formData = { tagline, category, style, color, iconPreference };

        // Step 1: Build natural-language prompt
        const userPrompt = buildLogoPrompt(logoName, formData);
        console.log(`📝 Logo prompt: ${userPrompt}`);

        // Step 2: Embed the prompt for vector search
        const queryVector = await embedText(userPrompt);
        console.log(`📊 Query vector generated: ${queryVector.length} dims`);

        // Step 3: RAG Retrieve — find closest matching logo design
        let retrievedContext = "";
        try {
            const results = await DesignAsset.aggregate([
                {
                    $vectorSearch: {
                        index: "design_asset_vector_index",
                        path: "embedding",
                        queryVector: queryVector,
                        numCandidates: 50,
                        limit: 1,
                        filter: { type: "logo" }
                    }
                },
                {
                    $project: {
                        description: 1,
                        cloudinaryUrl: 1,
                        score: { $meta: "vectorSearchScore" }
                    }
                }
            ]);

            if (results.length > 0) {
                retrievedContext = results[0].description;
                console.log(`🎯 RAG match found (score: ${results[0].score?.toFixed(3)}): ${retrievedContext.substring(0, 80)}...`);
            } else {
                console.log("⚠️  No RAG matches found — generating without context");
            }
        } catch (ragError) {
            console.warn("⚠️  Vector search unavailable:", ragError.message);
        }

        // Step 4: Augment — build rich Imagen prompt
        let imagenPrompt = `Create a ${userPrompt}. The logo should be flat design, centered, high resolution, with a clean solid background. Vector style, crisp edges, professional branding quality, 4k.`;
        
        if (retrievedContext) {
            imagenPrompt += ` Strictly match this design aesthetic: ${retrievedContext}`;
        }

        // Step 5: Generate image via Imagen
        console.log("🎨 Generating logo via Imagen...");
        const imageBuffer = await generateImage(imagenPrompt);

        // Step 6: Upload to Cloudinary
        console.log("☁️  Uploading logo to Cloudinary...");
        const cloudinaryUrl = await uploadBufferToCloudinary(imageBuffer, "nimbus");
        console.log("✅ Logo uploaded:", cloudinaryUrl);

        // Step 7: Self-learning ingest (fire-and-forget)
        const userId = req.user?.userId || null;
        ingestDesignAsset(cloudinaryUrl, "logo", userId, userPrompt, style || "modern");

        // Respond
        res.json({
            success: true,
            message: "Logo generated successfully!",
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
