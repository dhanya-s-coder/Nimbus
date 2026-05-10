import 'dotenv/config';
import mongoose from "mongoose";
import cloudinary from "./config/cloudinary.js";
import { DesignAsset } from "./models/DesignAsset.js";
import { describeDesign, embedText } from "./services/gemini.service.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function classifyImage(imageUrl) {
    try {
        const response = await fetch(imageUrl);

        const contentType = response.headers.get("content-type") || "image/png";

        const arrayBuffer = await response.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString("base64");

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                { inlineData: { mimeType: contentType, data: base64Image } },
                { text: "Analyze this image. Is it a 'poster' or a 'logo'? Reply ONLY with the word 'poster' or 'logo' entirely in lowercase." }
            ]
        });

        const type = result.text.trim().toLowerCase();
        return type === "logo" ? "logo" : "poster";
    } catch (err) {
        console.error("Classification error:", err.message);
        return "poster"; // fallback
    }
}

async function startAutoIngest() {
    console.log("🔥 Starting Automatic Cloudinary Ingest Pipeline...\n");

    try {
        console.log("📡 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB\n");

        console.log("☁️ Fetching images from Cloudinary 'nimbus' folder...");

        let allImages = [];
        let nextCursor = null;

        // Fetch paginated results from Cloudinary
        do {
            const result = await cloudinary.search
                .expression('folder:nimbus')
                .max_results(50)
                .next_cursor(nextCursor)
                .execute();

            allImages = allImages.concat(result.resources);
            nextCursor = result.next_cursor;
        } while (nextCursor);

        console.log(`📦 Found ${allImages.length} designs in Cloudinary!\n`);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < allImages.length; i++) {
            const image = allImages[i];
            const url = image.secure_url;

            console.log(`--- [${i + 1}/${allImages.length}] Processing Image: ${image.public_id} ---`);

            try {
                const exists = await DesignAsset.findOne({ cloudinaryUrl: url });
                if (exists) {
                    console.log("  ⏭️ Already in database. Skipping...");
                    continue;
                }

                console.log("  🤖 AI classifying asset type...");
                const type = await classifyImage(url);
                console.log(`  🏷️ Detected Type: ${type}`);

                console.log("  🔍 AI analyzing aesthetic...");
                const description = await describeDesign(url);
                console.log(`  📝 Description: ${description.substring(0, 80)}...`);

                console.log("  📊 Converting to vector...");
                const embedding = await embedText(description);

                // Save to MongoDB
                const asset = new DesignAsset({
                    userId: null,
                    isSystemTemplate: true,
                    cloudinaryUrl: url,
                    type: type,
                    templateType: "custom",
                    prompt: `Custom ${type} design template`,
                    description,
                    embedding
                });

                await asset.save();
                console.log(`  ✅ Successfully memorized!`);
                successCount++;

            } catch (err) {
                console.error(`  ❌ Failed: ${err.message}`);
                failCount++;
            } finally {
                if (i < allImages.length - 1) {
                    console.log("  ⏳ Waiting 15s to rest the AI mind...");
                    await new Promise(resolve => setTimeout(resolve, 35000));
                }
            }
        }

        console.log(`\n==================================================`);

        console.log(`Ingestion Complete!`);
        console.log(`   ✅ Succeeded: ${successCount}`);
        console.log(`   ❌ Failed: ${failCount}`);
        console.log(`   📦 Total in database: ${await DesignAsset.countDocuments()}`);
        console.log(`==================================================\n`);

    } catch (error) {
        console.error("❌ Fatal Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
        process.exit(0);
    }
}

startAutoIngest();
