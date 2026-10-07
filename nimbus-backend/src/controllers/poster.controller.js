import { savePosterDraft, getActivityByUserAndType, deleteActivity } from "../services/history.service.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryHelper.js";
import { generatePosterBackground } from "../services/poster.service.js";

export const generatePosterController = async (req, res) => {
    try {
        const { eventName, category, theme, formData, templateType, imageProvider } = req.body;
        const { url, mimeType, provider } = await generatePosterBackground({
            eventName, category, theme, formData, templateType, imageProvider
        });

        res.json({
            success: true,
            data: {
                image: { mimeType, url },
                provider
            }
        });
    } catch (error) {
        console.error("❌ Poster Generation Error:", error);
        res.status(error.status === 400 ? 400 : 500).json({ success: false, message: "Failed to generate poster", error: error.message });
    }
};

export const savePosterController = async (req, res) => {
    try {
        const { templateType, formData, generatedImageUrl, posterStyle, status, previewImage } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const storedFormData = { ...(formData || {}) };
        for (const key of ['speakerPhoto', 'eventLogo', 'collegeLogo', 'qr1Image', 'qr2Image']) {
            const value = storedFormData[key];
            if (typeof value === 'string' && value.startsWith('data:')) {
                const match = value.match(/^data:[^;]+;base64,(.*)$/);
                if (match) storedFormData[key] = await uploadBufferToCloudinary(Buffer.from(match[1], 'base64'), 'nimbus/poster-assets');
            }
        }
        // own-photo backgrounds arrive as data URLs: host them instead of bloating the DB
        let finalImageUrl = generatedImageUrl || null;
        if (typeof finalImageUrl === 'string' && finalImageUrl.startsWith('data:')) {
            const m = finalImageUrl.match(/^data:[^;]+;base64,(.*)$/);
            finalImageUrl = m ? await uploadBufferToCloudinary(Buffer.from(m[1], 'base64'), 'nimbus/poster-backgrounds') : null;
        }
        // small JPEG of the finished poster (History thumbnails)
        let previewUrl = null;
        if (typeof previewImage === 'string' && previewImage.startsWith('data:image/') && previewImage.length < 2_000_000) {
            const pm = previewImage.match(/^data:[^;]+;base64,(.*)$/);
            if (pm) previewUrl = await uploadBufferToCloudinary(Buffer.from(pm[1], 'base64'), 'nimbus/poster-previews');
        }
        const draft = await savePosterDraft(userId, {
            templateType,
            formData: storedFormData,
            generatedImageUrl: finalImageUrl,
            previewUrl,
            posterStyle: posterStyle || null,
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
