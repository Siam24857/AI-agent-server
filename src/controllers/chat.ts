import express from "express";
import { protect } from "./auth/middleware";
import { Conversation, Message } from "../models";

const router = express.Router();

router.use(protect);

router.get("/", async (req: any, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, data: conversations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/", async (req: any, res) => {
  try {
    const { title } = req.body;
    const conversation = new Conversation({
      userId: req.user._id,
      title: title || "New Conversation",
      messages: [],
    });
    await conversation.save();
    res.status(201).json({ success: true, data: conversation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user._id }).populate("messages");
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    res.json({ success: true, data: conversation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/:id/messages", async (req: any, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    const message = new Message({
      conversationId: conversation._id,
      content: req.body.content,
      role: "user",
      sender: req.user._id,
    });
    await message.save();
    conversation.messages.push(message._id);
    await conversation.save();
    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    await Conversation.deleteOne({ _id: req.params.id, userId: req.user._id });
    await Message.deleteMany({ conversationId: req.params.id });
    res.json({ success: true, message: "Conversation deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
