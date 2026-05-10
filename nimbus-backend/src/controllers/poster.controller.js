import { DesignAsset } from "../models/DesignAsset.js";
import { savePosterDraft, getActivityByUserAndType, deleteActivity } from "../services/history.service.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryHelper.js";
import { embedText, generateImage, ingestDesignAsset } from "../services/gemini.service.js";

/**
 * Build a natural-language prompt string from the template type and user form data.
 */
const buildPromptFromForm = (templateType, formData) => {
    const templateLabels = {
        academic: "Academic / Seminar",
        recruitment: "Recruitment / Hiring",
        event: "Event / Festival",
        hackathon: "Hackathon / Tech",
        announcement: "Official Announcement"
    };

    let prompt = `A professional ${templateLabels[templateType] || templateType} poster`;
    
    const parts = [];
    for (const [key, value] of Object.entries(formData)) {
        if (value && String(value).trim()) {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
            parts.push(`${label}: ${String(value).trim()}`);
        }
    }
    
    if (parts.length > 0) {
        prompt += ` with the following details: ${parts.join(", ")}`;
    }

    return prompt;
};

export const generatePosterController = async (req, res) => {
    try {
        const { templateType, formData } = req.body;

        if (!templateType || !formData) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Step 1: Build natural-language prompt from user input
        const userPrompt = buildPromptFromForm(templateType, formData);
        console.log(`📝 User prompt: ${userPrompt.substring(0, 100)}...`);

        // Step 2: Embed the user's prompt to get query vector
        const queryVector = await embedText(userPrompt);
        console.log(`📊 Query vector generated: ${queryVector.length} dims`);

        // Step 3: RAG Retrieve — find closest matching design via Vector Search
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
                        filter: { type: "poster" }
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
            console.warn("⚠️  Vector search unavailable (index may not exist yet):", ragError.message);
        }

        // Step 4: Augment — combine user prompt + retrieved aesthetic context
        let imagenPrompt = `Create a high-quality, professional poster design. ${userPrompt}.`;
        imagenPrompt += ` Technical requirements: Clean composition, sharp typography, balanced layout, vibrant colors, print-ready quality, 4k resolution.`;
        
        if (retrievedContext) {
            imagenPrompt += ` Strictly match this design aesthetic: ${retrievedContext}`;
        }

        // Step 5: Generate image via Imagen
        console.log("🎨 Generating poster via Imagen...");
        const imageBuffer = await generateImage(imagenPrompt);

        // Step 6: Upload to Cloudinary
        console.log("☁️  Uploading poster to Cloudinary...");
        const cloudinaryUrl = await uploadBufferToCloudinary(imageBuffer, "nimbus");
        console.log("✅ Poster uploaded:", cloudinaryUrl);

        // Step 7: Self-learning ingest (fire-and-forget — don't block the response)
        const userId = req.user?.userId || null;
        ingestDesignAsset(cloudinaryUrl, "poster", userId, userPrompt, templateType);

        // Respond
        res.json({
            success: true,
            message: "Poster generated successfully!",
            data: {
                image: {
                    mimeType: "image/png",
                    url: cloudinaryUrl
                }
            }
        });
    } catch (error) {
        console.error("❌ Poster Generation Error:", error);
        
        if (error.message?.includes("loading") || error.message?.includes("503")) {
            return res.status(503).json({ success: false, message: "AI model is loading. Please wait a few seconds and try again." });
        }
        
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