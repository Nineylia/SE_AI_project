import express from "express";
import { postFeatures } from "../controllers/mortgage.controller.js";

const router = express.Router();

router.post("/ai", postFeatures);

export default router;