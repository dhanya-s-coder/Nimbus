import express from "express";
import { generateLogoController, saveLogoController } from "../controllers/logo.controller.js";

const router = express.Router();

router.post("/generate", generateLogoController);
router.post("/save", saveLogoController);

export default router;
