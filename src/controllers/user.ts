import express from "express";
import { protect } from "./auth/middleware";
import { User } from "../models";

const router = express.Router();

router.use(protect);

router.get("/me", async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -resetPasswordToken -resetPasswordExpire");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/me", async (req: any, res) => {
  try {
    const { fullname, skills, experience, education, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullname, skills, experience, education, avatar },
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpire");
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -resetPasswordToken -resetPasswordExpire");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
