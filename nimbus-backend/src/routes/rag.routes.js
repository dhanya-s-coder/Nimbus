import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
    ingestController, searchController, listController, deleteController, posterContentController
} from "../controllers/rag.controller.js";

export const ragRouter = express.Router();
ragRouter.post("/ingest", authMiddleware, ingestController);
ragRouter.post("/search", authMiddleware, searchController);
ragRouter.get("/sources", authMiddleware, listController);
ragRouter.delete("/sources/:id", authMiddleware, deleteController);

export const generateRouter = express.Router();
generateRouter.post("/poster-content", authMiddleware, posterContentController);
