import express from "express";
import { protect } from "./auth/middleware";
import { Conversation, Message } from "../models";
import { ChatTool } from "../tools/chat";

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
    const userMessage = new Message({
      conversationId: conversation._id,
      content: req.body.content,
      role: "user",
      sender: req.user._id,
    });
    await userMessage.save();
    conversation.messages.push(userMessage._id);

    const history = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    const tool = new ChatTool();
    const result = await tool.execute({
      userId: req.user._id,
      message: req.body.content,
      history: history.map((m: any) => ({ role: m.role, content: m.content })),
    });

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    const assistantMessage = new Message({
      conversationId: conversation._id,
      content: result.data.content,
      role: "assistant",
      sender: "ai",
    });
    await assistantMessage.save();
    conversation.messages.push(assistantMessage._id);
    await conversation.save();

    res.status(201).json({ success: true, data: { user: userMessage, assistant: assistantMessage } });
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
