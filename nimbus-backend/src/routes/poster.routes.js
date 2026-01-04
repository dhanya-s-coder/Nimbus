import express from "express";
import {
    generatePosterController,
    savePosterController,
    getHistoryController,
    deleteActivityController
} from "../controllers/poster.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/generate", authMiddleware, generatePosterController);
router.post("/save", authMiddleware, savePosterController);
router.get("/history", authMiddleware, getHistoryController);
router.delete("/activity/:activityId", authMiddleware, deleteActivityController);

export default router;
