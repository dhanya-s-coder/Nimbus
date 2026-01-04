import nodemailer from "nodemailer";

console.log("---------------------------------------------------");
console.log("📧 Email Service Configuration:");
console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? process.env.EMAIL_USER : "MISSING"}`);
console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? "LOADED" : "MISSING"}`);
console.log("---------------------------------------------------");

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
