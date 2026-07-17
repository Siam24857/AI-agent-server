import { BaseTool, ToolResult } from "./base";
import { User, Conversation, ResumeAnalysis, ActivityLog } from "../models";

export class HistoryTool extends BaseTool {
  name = "history";
  description = "Retrieve user history and analytics";

  async execute(parameters: any): Promise<ToolResult> {
    try {
      const { userId, days = 30 } = parameters;

      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const conversations = await Conversation.find({
        userId,
        createdAt: { $gte: startDate },
      }).populate("messages").lean();

      const resumeAnalyses = await ResumeAnalysis.find({
        userId,
        createdAt: { $gte: startDate },
      }).lean();

      const activities = await ActivityLog.find({
        userId,
        createdAt: { $gte: startDate },
      }).lean();

      const stats = {
        totalConversations: conversations.length,
        totalResumeAnalyses: resumeAnalyses.length,
        totalActivities: activities.length,
        recentActivities: activities.sort((a: any, b: any) => b.createdAt - a.createdAt).slice(0, 5),
        averageResumeScore: resumeAnalyses.reduce((sum: number, r: any) => sum + r.analysis.score, 0) / (resumeAnalyses.length || 1),
      };

      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}
