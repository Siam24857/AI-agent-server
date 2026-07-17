import { BaseTool, ToolResult } from "./base";
import { User, Job, ResumeAnalysis } from "../models";

export class RecommendationTool extends BaseTool {
  name = "recommendation";
  description = "Generate recommendations based on user profile, history, and preferences";

  async execute(parameters: any): Promise<ToolResult> {
    try {
      const { userId, type = "jobs", limit = 5 } = parameters;

      if (type === "jobs") {
        const user: any = await User.findById(userId);
        if (!user) {
          return { success: false, error: "User not found" };
        }
        const jobs = await Job.find({ status: "active" }).populate("postedBy").lean();

        const recommendations = jobs.map((job: any) => {
          let score = 0;
          let reasons = [];

          if (user.skills) {
            job.skills.forEach((skill: string) => {
              if (user.skills.includes(skill)) {
                score += 10;
                reasons.push(`You have skill: ${skill}`);
              }
            });
          }

          if (user.experience?.some((exp: string) =>
            job.experience.includes(exp) ||
            (job.experience === "entry" && exp.includes("intern")) ||
            (job.experience === "senior" && exp.includes("senior"))
          )) {
            score += 15;
            reasons.push("Your experience matches job level");
          }

          const eduMatch = user.education?.find((edu: string) =>
            job.title.toLowerCase().includes(edu.toLowerCase().split(" ")[0])
          );
          if (eduMatch) {
            score += 8;
            reasons.push(`Your education aligns with ${eduMatch}`);
          }

          if (job.remote && !reasons.includes("Remote work option")) {
            reasons.push("Remote work option");
            score += 5;
          }

          return {
            ...job,
            matchScore: score,
            matchReason: reasons.slice(0, 3).join(", "),
            type: "job",
          };
        });

        recommendations.sort((a: any, b: any) => b.matchScore - a.matchScore);
        return { success: true, data: recommendations.slice(0, limit) };
      }

      return { success: true, data: [] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}
