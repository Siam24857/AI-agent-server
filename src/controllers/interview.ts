import express from "express";
import { protect } from "./auth/middleware";
import { InterviewTool } from "../tools";

const router = express.Router();

router.use(protect);

router.post("/questions", async (req, res) => {
  try {
    const { difficulty, type, count } = req.body;
    const tool = new InterviewTool();
    const result = await tool.execute({ difficulty, type, count });
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }
    res.json({ success: true, data: result.data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
