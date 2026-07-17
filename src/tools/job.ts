import { BaseTool, ToolResult } from "./base";
import { Job, Application } from "../models";

export class JobTool extends BaseTool {
  name = "job";
  description = "Manage job-related operations";

  async execute(parameters: any): Promise<ToolResult> {
    try {
      const { action, jobId, userId, data } = parameters;

      switch (action) {
        case "find":
          const jobs = await Job.find({ status: "active" }).populate("postedBy").limit(10).lean();
          return { success: true, data: jobs };
        case "apply":
          const newApplication = new Application({
            jobId,
            userId,
            resumeUrl: data.resumeUrl,
            coverLetter: data.coverLetter,
          });
          await newApplication.save();
          return { success: true, data: newApplication };
        default:
          throw new Error(`Action ${action} not supported`);
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}
