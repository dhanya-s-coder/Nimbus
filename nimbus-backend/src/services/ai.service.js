import { model } from "../config/gemini.js";

export async function generateEmail({ subject, prompt }) {
    if (!model) {
        throw new Error("AI model not initialized. Check GEMINI_API_KEY in .env file.");
    }

    const fullPrompt = `
You are an expert professional communications assistant at a prestigious academic institution. Your task is to draft a high-quality, formal email based on the specific parameters provided below.

**Input Parameters:**
- **Email Subject:** ${subject}
- **Main Context/Message:** ${prompt}

**Drafting Guidelines:**
1.  **Structure:** The email must include:
    * The Subject Line (clearly stated at the top).
    * A formal Salutation (e.g., Dear Students, Dear Professor, To the Office of...).
    * A clear, concise Body.
    * A formal Sign-off with the sender's details.
2.  **Formatting:** Use **bolding** for important details (dates, deadlines, venues) and use *bullet points* to list instructions or key takeaways for readability.
3.  **Tone:** Maintain a strictly professional, polite, and grammatically perfect tone suitable for an official university or corporate environment.
4.  **Output Constraint:** Do not include conversational filler (like "Here is your email"). Generate *only* the email text.

Draft the email now.email should be lomg detailed as]nd formal .
don't leave any unnecessary lines in the email . write the fully professional email .

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


    write the mail in english only. don't write large mail ,try to limit it in 2-3 paragraphs only.
`;

    try {
        const result = await model.generateContent(fullPrompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        throw new Error(`Failed to generate email: ${error.message}`);
    }
}
