import { getActivityByUserAndType, deleteActivity, saveLogoDraft } from "../services/history.service.js";
import { generateLogo } from "../services/logo.service.js";

export const generateLogoController = async (req, res) => {
    try {
        const { logoName } = req.body;

        if (!logoName) {
            return res.status(400).json({ success: false, message: "Logo name is required" });
        }

        const { url, mimeType } = await generateLogo(req.body);

        res.json({
            success: true,
            message: "Logo generated successfully!",
            data: { image: { url, mimeType } }
        });
    } catch (error) {
        console.error("❌ Logo Generation Error:", error);
        res.status(error.status === 400 ? 400 : 500).json({ success: false, message: "Failed to generate logo", error: error.message });
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
