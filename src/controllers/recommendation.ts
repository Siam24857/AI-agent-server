import express from "express";
import { protect } from "./auth/middleware";
import { RecommendationTool } from "../tools";
import { JobRecommendation } from "../models";

const router = express.Router();

router.use(protect);

router.get("/", async (req: any, res) => {
  try {
    const type = (req.query.type as string) || "jobs";
    const limit = parseInt(req.query.limit as string) || 5;
    const tool = new RecommendationTool();
    const result = await tool.execute({ userId: req.user._id, type, limit });
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }
    res.json({ success: true, data: result.data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/save", protect, async (req: any, res) => {
  try {
    const rec = new JobRecommendation({ ...req.body, userId: req.user._id });
    await rec.save();
    res.status(201).json({ success: true, data: rec });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/saved", protect, async (req: any, res) => {
  try {
    const recs = await JobRecommendation.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: recs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
