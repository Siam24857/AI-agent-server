import { BaseTool, ToolResult } from "./base";
import { User, ResumeAnalysis, Conversation } from "../models";

export class AnalyticsTool extends BaseTool {
  name = "analytics";
  description = "Generate analytics and insights from user data";

  async execute(parameters: any): Promise<ToolResult> {
    try {
      const { userId, days = 30 } = parameters;

      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }

      const resumeAnalyses = await ResumeAnalysis.find({ userId }).lean();
      const conversations = await Conversation.find({ userId }).populate("messages").lean();

      const analytics = {
        totalResumesAnalyzed: resumeAnalyses.length,
        averageScore: resumeAnalyses.reduce((sum: number, r: any) => sum + r.analysis.score, 0) / (resumeAnalyses.length || 1),
        atsScores: resumeAnalyses.map(r => r.analysis.atsScore),
        totalConversations: conversations.length,
        lastActive: user.lastLogin || user.createdAt,
        skillGrowth: user.skills?.length || 0,
      };

      return { success: true, data: analytics };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}
