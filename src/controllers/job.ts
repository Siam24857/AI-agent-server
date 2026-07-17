import express from "express";
import mongoose from "mongoose";
import { protect, isAdmin } from "./auth/middleware";
import { Job, Application } from "../models";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, location, type, experience, search, sort, page = "1", limit = "9" } = req.query;
    const filter: any = { status: "active" };
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (type) filter.type = type;
    if (experience) filter.experience = experience;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    const sortMap: any = {
      latest: { createdAt: -1 },
      salary: { salary: 1 },
      title: { title: 1 },
    };
    const sortOption = sortMap[sort as string] || { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, parseInt(limit as string) || 9);
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate("postedBy", "fullname avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: jobs,
      count: jobs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "fullname avatar");
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/", protect, isAdmin, async (req: any, res) => {
  try {
    const job = new Job({ ...req.body, postedBy: req.user._id });
    await job.save();
    res.status(201).json({ success: true, data: job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/:id/apply", protect, async (req: any, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid job id" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const existing = await Application.findOne({
      jobId: req.params.id,
      userId: req.user._id,
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "You have already applied to this job" });
    }

    const application = new Application({
      jobId: req.params.id,
      userId: req.user._id,
      resumeUrl: req.body.resumeUrl || req.user.resumeUrl || "N/A",
      coverLetter: req.body.coverLetter,
    });
    await application.save();
    res.status(201).json({ success: true, data: application });
  } catch (error: any) {
    if (error?.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
