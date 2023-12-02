import express from "express";
import { postFeatures } from "../controllers/mortgage.controller";

const router = express.Router();

router.post("/Mortgage_calculator", postFeatures);

export default router;