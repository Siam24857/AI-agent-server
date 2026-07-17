import express from "express";
import { protect } from "./auth/middleware";
import multer from "multer";
import { ResumeTool } from "../tools";
import { ResumeAnalysis } from "../models";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.use(protect);

router.post("/analyze", upload.single("resume"), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume file uploaded" });
    }
    const tool = new ResumeTool();
    const result = await tool.execute({
      resumeUrl: req.file.path,
      filename: req.file.originalname,
      userId: req.user._id,
    });
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }
    res.status(201).json({ success: true, data: result.data, extractedText: result.extractedText });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/", async (req: any, res) => {
  try {
    const analyses = await ResumeAnalysis.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: analyses });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({ _id: req.params.id, userId: req.user._id });
    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
