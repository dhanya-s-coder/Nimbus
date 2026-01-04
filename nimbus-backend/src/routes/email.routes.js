import express from "express";
import {
    generateEmailController,
    saveEmailController,
    sendEmailController,
    getGlobalHistoryController,
    getHistoryController,
    deleteActivityController
} from "../controllers/email.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/generate", authMiddleware, generateEmailController);
router.post("/save", authMiddleware, saveEmailController);
router.post("/send", authMiddleware, sendEmailController);
router.get("/history", authMiddleware, getGlobalHistoryController);
router.get("/history/email", authMiddleware, getHistoryController);
router.delete("/activity/:activityId", authMiddleware, deleteActivityController);

export default router;
