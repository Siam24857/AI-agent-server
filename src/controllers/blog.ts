import express from "express";
import { BlogPost } from "../models";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, tag, search } = req.query as Record<string, string>;
    const filter: any = { status: "published" };
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const posts = await BlogPost.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .populate("author", "fullname avatar");

    res.json({ success: true, data: posts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug }).populate(
      "author",
      "fullname avatar"
    );
    if (!post) {
      return res.status(404).json({ success: false, message: "Blog post not found" });
    }
    res.json({ success: true, data: post });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
