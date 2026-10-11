import express from "express";
import {
    generateReportController,
    generateReportLatexController,
    compileReportController,
    saveReportController,
    getHistoryController,
    deleteActivityController
} from "../controllers/report.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/generate", authMiddleware, generateReportController);
router.post("/generate-latex", authMiddleware, generateReportLatexController);
router.post("/compile", authMiddleware, compileReportController);
router.post("/save", authMiddleware, saveReportController);
router.get("/history", authMiddleware, getHistoryController);
router.delete("/activity/:activityId", authMiddleware, deleteActivityController);

export default router;
