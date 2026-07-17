import { BaseTool, ToolResult } from "./base";
import * as models from "../models";

export class SearchTool extends BaseTool {
  name = "search";
  description = "Search across data using fuzzy matching, keyword search, and semantic search";

  async execute(parameters: any): Promise<ToolResult> {
    try {
      const { query, filters, model, limit = 10 } = parameters;
      const ModelClass = this.getModelByName(model);

      let results;

      if (model === "Job") {
        results = await ModelClass.find({ status: "active" })
          .populate("postedBy")
          .limit(limit)
          .lean();

        const searchScore = (job: any) => {
          let score = 0;

          if (job.title.toLowerCase().includes(query.toLowerCase())) score += 10;
          if (job.company.toLowerCase().includes(query.toLowerCase())) score += 8;
          if (job.description.toLowerCase().includes(query.toLowerCase())) score += 5;
          if (job.location.toLowerCase().includes(query.toLowerCase())) score += 4;

          job.skills.forEach((skill: string) => {
            if (skill.toLowerCase().includes(query.toLowerCase())) score += 2;
          });

          if (filters?.location && job.location === filters.location) score += 6;
          if (filters?.type && job.type === filters.type) score += 3;

          return score;
        };

        results = results
          .map((job: any) => ({ ...job, searchScore: searchScore(job) }))
          .sort((a: any, b: any) => b.searchScore - a.searchScore)
          .slice(0, limit);
      } else if (model === "User") {
        results = await ModelClass.find({
          $or: [
            { fullname: { $regex: query, $options: "i" } },
            { skills: { $regex: query, $options: "i" } },
            { experience: { $regex: query, $options: "i" } },
          ],
        })
          .limit(limit)
          .lean();
      } else {
        results = await ModelClass.find({}).limit(limit).lean();
      }

      return { success: true, data: results, count: results.length };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private getModelByName(modelName: string): any {
    const modelMap = {
      User: models.User,
      Job: models.Job,
      ResumeAnalysis: models.ResumeAnalysis,
    };
    const model = modelMap[modelName as keyof typeof modelMap];
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }
    return model;
  }
}
