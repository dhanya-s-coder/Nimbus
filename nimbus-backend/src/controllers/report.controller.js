import { generateReportContent } from "../services/report.service.js";
import { generateReportLatex } from "../services/reportLatex.service.js";
import { compileLatex, LatexError } from "../services/latex/compile.service.js";
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
        const { reportType, title, rawInput, content, status, format } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const reportData = {
            reportType,
            title,
            rawInput,
            content,
            format: format === 'latex' ? 'latex' : 'markdown',
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

/** Notes (+ knowledge base) -> structured report -> LaTeX source. */
export const generateReportLatexController = async (req, res) => {
    try {
        const { reportType, title, rawInput, textProvider } = req.body;
        if (!reportType || !title || !rawInput) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const data = await generateReportLatex({ userId: req.user?.userId, reportType, title, rawInput, textProvider });
        res.json({ success: true, data: { latex: data.latex, sources: data.sources, grounded: data.grounded } });
    } catch (error) {
        console.error("❌ LaTeX report generation error:", error.message);
        res.status(error.status === 400 ? 400 : 500).json({ success: false, message: "Failed to generate report", error: error.message });
    }
};

/** LaTeX source -> PDF (application/pdf). Compile errors come back as JSON with the log. */
export const compileReportController = async (req, res) => {
    try {
        const pdf = await compileLatex(req.body?.latex);
        res.set({ "Content-Type": "application/pdf", "Content-Length": pdf.length, "Cache-Control": "no-store" });
        res.send(pdf);
    } catch (error) {
        const known = error instanceof LatexError;
        if (!known) console.error("❌ LaTeX compile error:", error);
        res.status(known ? error.status : 500).json({ success: false, message: error.message, log: known ? error.log : undefined });
    }
};
