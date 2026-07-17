import express from "express";
import { protect, isAdmin } from "./auth/middleware";
import { Job, Application } from "../models";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, location, type, experience, search } = req.query;
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
    const jobs = await Job.find(filter).populate("postedBy", "fullname avatar").sort({ createdAt: -1 });
    res.json({ success: true, data: jobs, count: jobs.length });
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
    const application = new Application({
      jobId: req.params.id,
      userId: req.user._id,
      resumeUrl: req.body.resumeUrl,
      coverLetter: req.body.coverLetter,
    });
    await application.save();
    res.status(201).json({ success: true, data: application });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
