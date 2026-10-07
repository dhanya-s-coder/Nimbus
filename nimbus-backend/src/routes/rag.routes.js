import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
    ingestController, searchController, listController, deleteController, posterContentController,
    capabilitiesController, ingestFileController
} from "../controllers/rag.controller.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 1 } });

export const ragRouter = express.Router();
ragRouter.post("/ingest", authMiddleware, ingestController);
ragRouter.get("/capabilities", authMiddleware, capabilitiesController);
ragRouter.post("/ingest-file", authMiddleware, (req, res, next) => upload.single("file")(req, res, (err) => (err ? res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ success: false, message: err.code === "LIMIT_FILE_SIZE" ? "File too large (max 8 MB)" : err.message }) : next())), ingestFileController);
ragRouter.post("/search", authMiddleware, searchController);
ragRouter.get("/sources", authMiddleware, listController);
ragRouter.delete("/sources/:id", authMiddleware, deleteController);

export const generateRouter = express.Router();
generateRouter.post("/poster-content", authMiddleware, posterContentController);
