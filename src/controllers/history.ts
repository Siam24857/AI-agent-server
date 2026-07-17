import express from "express";
import { protect } from "./auth/middleware";
import { HistoryTool } from "../tools";

const router = express.Router();

router.use(protect);

router.get("/", async (req: any, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const tool = new HistoryTool();
    const result = await tool.execute({ userId: req.user._id, days });
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }
    res.json({ success: true, data: result.data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
