import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveReport, getActivityByUserAndType, deleteActivity } from "../services/history.service.js";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

export const generateReportController = async (req, res) => {
    try {
        const { reportType, title, rawInput } = req.body;

        if (!reportType || !title || !rawInput) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (!model) {
            return res.status(500).json({ success: false, message: "AI model not initialized" });
        }

        const prompt = `
You are an expert administrative assistant. Your task is to generate a professional, structured report based on the following details.

Report Type: ${reportType}
Report Title: ${title}
Raw Notes/Input: 
${rawInput}

Guidelines:
1. Use professional, formal language.
2. Structure the report with clear Markdown headers (# for title, ## for sections).
3. Use bullet points and tables where appropriate for clarity.
4. If it's "Meeting Minutes", include sections for Attendees, Discussion Points, Decisions Made, and Action Items.
5. If it's "Event Summary", include Participation, Key Highlights, Challenges, and Recommendations.
6. If it's "Monthly Progress", summarize metrics, achievements, and future goals.
7. Do not include conversational filler. Just the report text.

Generate the report now in English.
`;

        const result = await model.generateContent(prompt);
        const reportContent = result.response.text();

        res.json({
            success: true,
            data: {
                content: reportContent
            }
        });
    } catch (error) {
        console.error("❌ Report Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate report", error: error.message });
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
