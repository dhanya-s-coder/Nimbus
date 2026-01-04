import { sendEmail } from "../services/email.service.js";
import { getActivityByUser, saveEmailDraft, saveSentEmail, deleteActivity, getActivityByUserAndType } from "../services/history.service.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("⚠️  WARNING: GEMINI_API_KEY is not set in .env file");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

async function generateEmail({ subject, prompt }) {
    if (!model) {
        throw new Error("AI model not initialized. Check GEMINI_API_KEY in .env file.");
    }

    const fullPrompt = `
You are an expert professional communications assistant at a prestigious academic institution. Your task is to draft a high-quality, formal email based on the specific parameters provided below.

Input Parameters:
- Email Subject: ${subject}
- Main Context/Message: ${prompt}

Drafting Guidelines:
1. Structure: The email must include:
    A formal Salutation (e.g., Dear Students, Dear Professor, To the Office of...).
    A clear, concise Body.
    A formal Sign-off with the sender's details.
2. Tone: Maintain a strictly professional, polite, and grammatically perfect tone suitable for an official university or corporate environment.
3. Output Constraint: Do not include conversational filler (like "Here is your email"). Generate only the email text.

Draft the email now.email should be detailed and formal .
don't leave any unnecessary lines in the email . write the fully professional email .
write the mail in english only. don't write large mail ,try to limit it in 2-3 paragraphs only. 
also don't write the subject in the mail body.

sample email generation example:-
    Subject: NOTICE: Commencement of New Semester (January 2026)

    Date: December 11, 2025 To: All Students, IIT (ISM) Dhanbad From: Office of the Dean (Academic Affairs)

    Dear Students,
    This email serves to officially inform you regarding the commencement of the upcoming academic session at the Indian Institute of Technology (Indian School of Mines), Dhanbad.
    Please be advised that the new semester for the Academic Year 2025-2026 is scheduled to begin on Thursday, January 1, 2026.

    Key Instructions:
    Commencement of Classes: Academic activities and regular classes will resume promptly on January 1, 2026.
    Attendance: All students are expected to be present on campus and attend classes from the first day. Strict adherence to the attendance policy will be maintained from the start of the semester.
    Timetable: The detailed class schedule for the upcoming semester will be made available on the MIS portal shortly.
    We advise all students to make their travel arrangements accordingly to ensure they report to the institute on time.
    We look forward to welcoming you back for a productive and successful semester.
    Sincerely,
    [name].
`;

    try {
        const result = await model.generateContent(fullPrompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        throw new Error(`Failed to generate email: ${error.message}`);
    }
}

export const generateEmailController = async (req, res) => {
    try {
        const { subject, prompt } = req.body;
        if (!subject.trim()) return res.status(400).json({ success: false, message: "Subject is required" });
        if (!prompt.trim()) return res.status(400).json({ success: false, message: "Prompt is required" });

        const emailBody = await generateEmail({ subject, prompt });
        res.json({ success: true, data: { emailBody } });
    } catch (error) {
        console.error("❌ Email Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate email", error: error.message });
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
