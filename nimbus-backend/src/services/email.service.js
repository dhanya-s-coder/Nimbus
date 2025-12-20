import { transporter } from "../config/sendMail.js";

export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html, // Support for HTML emails
        });
        return info;
    } catch (error) {
        throw new Error("Email sending failed: " + error.message);
    }
};
