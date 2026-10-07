import { sendEmail } from "../services/email.service.js";
import { getActivityByUser, saveEmailDraft, saveSentEmail, deleteActivity, getActivityByUserAndType } from "../services/history.service.js";
import { generateEmail } from "../services/email.generate.service.js";

export const generateEmailController = async (req, res) => {
    try {
        const { subject, prompt, textProvider } = req.body;
        if (!subject.trim()) return res.status(400).json({ success: false, message: "Subject is required" });
        if (!prompt.trim()) return res.status(400).json({ success: false, message: "Prompt is required" });

        const { text: emailBody, sources } = await generateEmail({ userId: req.user?.userId, subject, prompt, textProvider });
        res.json({ success: true, data: { emailBody, sources } });
    } catch (error) {
        console.error("❌ Email Generation Error:", error);
        res.status(error.status === 400 ? 400 : 500).json({ success: false, message: "Failed to generate email", error: error.message });
    }
};

export const saveEmailController = async (req, res) => {
    try {
        const { subject, prompt, content, recipient } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const draft = await saveEmailDraft(userId, {
            subject: subject,
            prompt,
            content,
            recipient
        });

        res.status(201).json({ success: true, message: "Email saved successfully", data: draft });
    } catch (error) {
        console.error("❌ Error saving email:", error);
        res.status(500).json({ success: false, message: "Failed to save email", error: error.message });
    }
};

export const sendEmailController = async (req, res) => {
    try {
        const { subject, prompt, content, recipient } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
        if (!subject.trim()) return res.status(400).json({ success: false, message: "Subject is required" });
        if (!recipient) return res.status(400).json({ success: false, message: "Recipient is required" });
        if (!content.trim()) return res.status(400).json({ success: false, message: "Content is required" });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipient)) {
            return res.status(400).json({ success: false, message: "Invalid recipient email format" });
        }

        await sendEmail({ to: recipient, subject, text: content });

        const activity = await saveSentEmail(userId, { subject, prompt, content, recipient });

        res.json({ success: true, message: "Email sent successfully", data: activity });
    } catch (error) {
        console.error("❌ Email Sending Error:", error);
        res.status(500).json({ success: false, message: "Failed to send email", error: error.message });
    }
};

export const getGlobalHistoryController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const activities = await getActivityByUser(userId);

        const organized = {
            emails: activities.filter(a => a.type === 'email'),
            posters: activities.filter(a => a.type === 'poster'),
            logos: activities.filter(a => a.type === 'logo'),
            reports: activities.filter(a => a.type === 'report'),
            drafts: activities.filter(a => a.status === 'draft'),
            all: activities
        };

        res.json({ success: true, data: organized });
    } catch (error) {
        console.error("❌ Global History Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch global history", error: error.message });
    }
};

export const getHistoryController = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const activities = await getActivityByUserAndType(userId, 'email');
        res.json({ success: true, count: activities.length, data: activities });
    } catch (error) {
        console.error("❌ History Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch history", error: error.message });
    }
};

export const deleteActivityController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
        const result = await deleteActivity(userId, req.params.activityId);

        if (!result) return res.status(404).json({ success: false, message: "Activity not found" });

        res.json({ success: true, message: "Activity deleted successfully" });
    } catch (error) {
        console.error("❌ Delete Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete activity", error: error.message });
    }
};
