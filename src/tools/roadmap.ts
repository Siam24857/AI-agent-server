import { BaseTool, ToolResult } from "./base";
import { User, LearningRoadmap } from "../models";
import geminiService from "../services/gemini";

export class RoadmapTool extends BaseTool {
  name = "roadmap";
  description = "Generate personalized AI learning roadmaps based on career goals and current skills";

  async execute(parameters: any): Promise<ToolResult> {
    try {
      const { userId, targetRole, timeframe = "6 months", currentRole } = parameters;

      const user: any = await User.findById(userId).lean();
      if (!user) {
        return { success: false, error: "User not found" };
      }

      const profile = `Current role: ${currentRole || user.role || "not specified"}
Skills: ${(user.skills || []).join(", ") || "none listed"}
Experience: ${(user.experience || []).join(", ") || "none listed"}
Education: ${(user.education || []).join(", ") || "none listed"}`;

      const prompt = `You are an elite career coach and learning designer.
Create a detailed, personalized learning roadmap for this candidate.

CANDIDATE PROFILE:
${profile}

GOAL: Become a ${targetRole}
TIMEFRAME: ${timeframe}

Return ONLY valid JSON:
{
  "title": <string>,
  "overview": <string>,
  "currentSkills": [<string>],
  "requiredSkills": [<string>],
  "gaps": [<string>],
  "timeline": <string>,
  "weeks": [
    {
      "week": <number>,
      "title": <string>,
      "objectives": [<string>],
      "tasks": [<string>],
      "resources": [{ "type": "course"|"article"|"project"|"video", "title": <string>, "url": <string> }],
      "estimatedHours": <number>
    }
  ],
  "milestones": [{ "title": <string>, "week": <number> }],
  "resources": [{ "type": <string>, "title": <string>, "url": <string> }]
}
Provide 8-12 weeks. Use real, well-known learning resources (official docs, freeCodeCamp, Coursera, YouTube, MDN, etc.).`;

      const plan = await geminiService.generateJSON(prompt, {
        temperature: 0.7,
        maxOutputTokens: 8192,
        systemInstruction: "You are a world-class career coach. Respond with valid JSON only.",
      });

      const roadmap = new LearningRoadmap({
        userId,
        title: plan.title || `Learning Path for ${targetRole}`,
        weekPlan: plan.weeks || [],
        currentWeek: 1,
        status: "active",
        plan: {
          currentSkills: plan.currentSkills || [],
          requiredSkills: plan.requiredSkills || [],
          gaps: plan.gaps || [],
          learningPath: plan.weeks || [],
          timeline: plan.timeline || timeframe,
          milestones: plan.milestones || [],
          resources: plan.resources || [],
        },
      });

      await roadmap.save();
      return { success: true, data: roadmap };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
