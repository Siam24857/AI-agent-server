import express from "express";
import { protect } from "./auth/middleware";
import { RoadmapTool } from "../tools";
import { LearningRoadmap } from "../models";

const router = express.Router();

router.use(protect);

router.post("/generate", async (req: any, res) => {
  try {
    const { targetRole, timeframe } = req.body;
    const tool = new RoadmapTool();
    const result = await tool.execute({ userId: req.user._id, targetRole, timeframe });
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }
    res.status(201).json({ success: true, data: result.data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/", async (req: any, res) => {
  try {
    const roadmaps = await LearningRoadmap.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: roadmaps });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const roadmap = await LearningRoadmap.findOne({ _id: req.params.id, userId: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }
    res.json({ success: true, data: roadmap });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/:id/week", async (req: any, res) => {
  try {
    const roadmap = await LearningRoadmap.findOne({ _id: req.params.id, userId: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }
    roadmap.currentWeek = req.body.currentWeek || roadmap.currentWeek;
    if (req.body.status) roadmap.status = req.body.status;
    await roadmap.save();
    res.json({ success: true, data: roadmap });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
