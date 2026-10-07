import { generateReportContent } from "../services/report.service.js";
import { saveReport, getActivityByUserAndType, deleteActivity } from "../services/history.service.js";

export const generateReportController = async (req, res) => {
    try {
        const { reportType, title, rawInput } = req.body;

        if (!reportType || !title || !rawInput) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const { text: reportContent, sources } = await generateReportContent({ userId: req.user?.userId, reportType, title, rawInput, textProvider: req.body.textProvider });

        res.json({
            success: true,
            data: {
                content: reportContent,
                sources
            }
        });
    } catch (error) {
        console.error("❌ Report Generation Error:", error);
        res.status(error.status === 400 ? 400 : 500).json({ success: false, message: "Failed to generate report", error: error.message });
    }
};

export const saveReportController = async (req, res) => {
    try {
        const { reportType, title, rawInput, content, status } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const reportData = {
            reportType,
            title,
            rawInput,
            content,
            status: status || 'final'
        };

        const savedReport = await saveReport(userId, reportData);

        res.status(201).json({
            success: true,
            message: "Report saved successfully",
            data: savedReport
        });
    } catch (error) {
        console.error("❌ Error saving report:", error);
        res.status(500).json({ success: false, message: "Failed to save report", error: error.message });
    }
};

export const getHistoryController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const activities = await getActivityByUserAndType(userId, 'report');
        res.json({ success: true, count: activities.length, data: activities });
    } catch (error) {
        console.error("❌ Error fetching report history:", error);
        res.status(500).json({ success: false, message: "Failed to fetch history", error: error.message });
    }
};

export const deleteActivityController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
        const result = await deleteActivity(userId, req.params.activityId);

        if (!result) return res.status(404).json({ success: false, message: "Report not found" });

        res.json({ success: true, message: "Report deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting report:", error);
        res.status(500).json({ success: false, message: "Failed to delete report", error: error.message });
    }
};
