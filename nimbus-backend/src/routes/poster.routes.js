import express from "express";
import { generatePosterController, savePosterController } from "../controllers/poster.controller.js";

const router = express.Router();

router.post("/generate", generatePosterController);
router.post("/save", savePosterController);

export default router;
