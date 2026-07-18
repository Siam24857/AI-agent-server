import express from "express";
import { Job, ResumeAnalysis, User, UserActivity } from "../models";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [activeJobs, resumesAnalyzed, interviewsPracticed, totalUsers] = await Promise.all([
      Job.countDocuments({ status: "active" }),
      ResumeAnalysis.countDocuments(),
      UserActivity.countDocuments({ entity: "interview" }),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        activeJobs,
        resumesAnalyzed,
        interviewsPracticed,
        totalUsers,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
