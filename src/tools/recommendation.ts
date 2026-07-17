import { BaseTool, ToolResult } from "./base";
import { User, Job } from "../models";
import geminiService from "../services/gemini";

export class RecommendationTool extends BaseTool {
  name = "recommendation";
  description = "Generate AI-powered job and resource recommendations based on user profile";

  async execute(parameters: any): Promise<ToolResult> {
    try {
      const { userId, type = "jobs", limit = 5 } = parameters;

      const user: any = await User.findById(userId).lean();
      if (!user) {
        return { success: false, error: "User not found" };
      }

      const jobs = await Job.find({ status: "active" })
        .populate("postedBy", "fullname")
        .lean();

      if (type === "jobs") {
        const jobContext = jobs
          .map(
            (j: any, i: number) =>
              `${i + 1}. TITLE: ${j.title} | COMPANY: ${j.company} | LOCATION: ${j.location} | TYPE: ${j.type} | EXPERIENCE: ${j.experience} | SKILLS: ${(j.skills || []).join(", ")} | SALARY: ${j.salary} | REMOTE: ${j.remote}`
          )
          .join("\n");

        const profile = `Name: ${user.fullname}
Skills: ${(user.skills || []).join(", ") || "none listed"}
Experience: ${(user.experience || []).join(", ") || "none listed"}
Education: ${(user.education || []).join(", ") || "none listed"}`;

        const prompt = `You are an AI career matching engine.
Given the candidate profile and the list of available jobs, rank the BEST matches and explain why.

CANDIDATE PROFILE:
${profile}

AVAILABLE JOBS:
${jobContext || "No jobs available"}

Return ONLY valid JSON: an array (max ${limit}) of objects:
{
  "jobIndex": <1-based index from the list above>,
  "matchScore": <number 0-100>,
  "matchReason": <string short reason>,
  "fitSkills": [<string>, ...]
}
Sort by matchScore descending. Only include jobs with a genuine fit (matchScore >= 40).`;

        const aiRecs = await geminiService.generateJSON<any[]>(prompt, {
          temperature: 0.5,
          maxOutputTokens: 2048,
          systemInstruction:
            "You are a precise job-matching AI. Respond with valid JSON only.",
        });

        const recommendations = (aiRecs || [])
          .map((r: any) => {
            const job = jobs[(Number(r.jobIndex) || 1) - 1];
            if (!job) return null;
            return {
              ...job,
              matchScore: Number(r.matchScore) || 0,
              matchReason: r.matchReason || "",
              fitSkills: Array.isArray(r.fitSkills) ? r.fitSkills : [],
              type: "job",
            };
          })
          .filter(Boolean)
          .slice(0, limit);

        return { success: true, data: recommendations };
      }

      // fallback for non-job types
      return { success: true, data: [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
