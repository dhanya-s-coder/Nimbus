import express from "express";
import {
    generateLogoController,
    saveLogoController,
    getHistoryController,
    deleteActivityController
} from "../controllers/logo.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/generate", authMiddleware, generateLogoController);
router.post("/save", authMiddleware, saveLogoController);
router.get("/history", authMiddleware, getHistoryController);
router.delete("/activity/:activityId", authMiddleware, deleteActivityController);

export default router;
