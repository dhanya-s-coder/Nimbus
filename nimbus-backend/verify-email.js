import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env - try both current dir and parent to be safe, but start with current
const envPath = path.resolve(__dirname, ".env");
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

console.log("---------------------------------------------------");
console.log("Cloud Configuration Check:");
console.log(`EMAIL_USER: ${user ? user : "MISSING"}`);
// Show first char and last 2 chars for verification without leaking full secret
console.log(`EMAIL_PASS: ${pass ? (pass.length > 3 ? pass[0] + "****" + pass.slice(-2) : "SET (TOO SHORT)") : "MISSING"}`);
console.log(`EMAIL_PASS Length: ${pass ? pass.length : 0}`);
console.log("---------------------------------------------------");

if (!user || !pass) {
    console.error("❌ Aborting: Missing credentials.");
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: user,
        pass: pass
    }
});

console.log("Attempting to send test email...");

const mailOptions = {
    from: user,
    to: user, // Send to self
    subject: "Nimbus SMTP Test",
    text: "If you see this, your SMTP configuration is correct!"
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error("❌ Error sending email:", error);
    } else {
        console.log("✅ Email sent successfully: " + info.response);
    }
});
