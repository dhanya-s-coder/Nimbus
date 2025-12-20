import express from "express";
import {
    generateEmailController,
    saveDraftController,
    sendEmailController,
    getHistoryController,
    getActivityByTypeController,
    deleteActivityController
} from "../controllers/email.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All email routes require authentication
router.post("/generate", authMiddleware, generateEmailController);
router.post("/save", authMiddleware, saveDraftController);
router.post("/send", authMiddleware, sendEmailController);
router.get("/history", authMiddleware, getHistoryController);
router.get("/history/:type", authMiddleware, getActivityByTypeController);
router.delete("/activity/:activityId", authMiddleware, deleteActivityController);

export default router;
