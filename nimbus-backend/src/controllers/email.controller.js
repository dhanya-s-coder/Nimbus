import { generateEmail } from "../services/ai.service.js";
import { sendEmail } from "../services/email.service.js";
import { getActivityByUser, saveEmailDraft, saveSentEmail, deleteActivity } from "../services/history.service.js";
import { Activity } from "../models/Activity.js";

export const generateEmailController = async (req, res) => {
    try {
        const { subject, prompt } = req.body;
        if (!subject || !prompt) {
            return res.status(400).json({ error: "Missing required fields: subject, prompt" });
        }
        const emailBody = await generateEmail({ subject, prompt });
        res.json({ emailBody });
    } catch (error) {
        console.error("Error generating email:", error.message);
        res.status(500).json({ error: error.message || "Failed to generate email" });
    }
};

export const saveDraftController = async (req, res) => {
    try {
        const { subject, prompt, content, recipient } = req.body;
        const userId = req.user?.userId || req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated", reason: "MISSING_USER_ID_IN_PAYLOAD" });
        }

        const draftData = {
            subject: subject || 'Email Draft',
            prompt,
            content,
            recipient
        };

        const draft = await saveEmailDraft(userId, draftData);

        res.json({
            message: "Draft saved successfully",
            draft
        });
    } catch (error) {
        console.error("Error saving draft:", error);
        res.status(500).json({ error: error.message });
    }
};

export const sendEmailController = async (req, res) => {
    try {
        const { recipient, subject, content, prompt } = req.body;
        const userId = req.user?.userId || req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated", reason: "MISSING_USER_ID_IN_PAYLOAD" });
        }

        if (!recipient) {
            return res.status(400).json({ error: "Recipient email is required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipient)) {
            return res.status(400).json({ error: "Invalid recipient email format" });
        }

        // Send the email
        await sendEmail({ to: recipient, subject, text: content });

        const emailData = {
            subject: subject || 'Sent Email',
            prompt,
            content,
            recipient
        };

        const activity = await saveSentEmail(userId, emailData);

        res.json({
            message: "Email sent successfully",
            activity
        });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getHistoryController = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated", reason: "MISSING_USER_ID_IN_PAYLOAD" });
        }

        // Get all activities for this user
        const activities = await getActivityByUser(userId);

        // Organize by type
        const organized = {
            emails: activities.filter(a => a.type === 'email'),
            posters: activities.filter(a => a.type === 'poster'),
            logos: activities.filter(a => a.type === 'logo'),
            drafts: activities.filter(a => a.status === 'draft'),
            all: activities
        };

        res.json(organized);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getActivityByTypeController = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { type } = req.params;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated", reason: "MISSING_USER_ID_IN_PAYLOAD" });
        }

        if (!['email', 'poster', 'logo'].includes(type)) {
            return res.status(400).json({ error: "Invalid activity type" });
        }

        const activities = await Activity.find({
            user_id: userId,
            type: type
        }).sort({ createdAt: -1 });

        res.json(activities);
    } catch (error) {
        console.error("Error fetching activities:", error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteActivityController = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { activityId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated", reason: "MISSING_USER_ID_IN_PAYLOAD" });
        }

        // The deleteActivity service already handles both embedded and collection activities
        // and checks for user ownership.
        const result = await deleteActivity(userId, activityId);

        if (!result) {
            return res.status(404).json({ error: "Activity not found" });
        }

        res.json({ message: "Activity deleted successfully" });
    } catch (error) {
        console.error("Error deleting activity:", error);
        res.status(500).json({ error: error.message });
    }
};
