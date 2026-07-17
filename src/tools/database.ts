import { BaseTool, ToolResult } from "./base";
import * as models from "../models";

export class DatabaseTool extends BaseTool {
  name = "database";
  description = "Execute database queries and operations using Mongoose";

  async execute(parameters: any): Promise<ToolResult> {
    try {
      const { action, model, filter, data, options } = parameters;
      const ModelClass = this.getModelByName(model);

      switch (action) {
        case "find":
          const results = await ModelClass.find(filter).populate(options?.populate || []);
          return { success: true, data: results, count: results.length };
        case "create":
          const doc = new ModelClass(data);
          const saved = await doc.save();
          return { success: true, data: saved };
        case "update":
          const updated = await ModelClass.findOneAndUpdate(filter, data, {
            new: true,
            runValidators: true,
          });
          return { success: true, data: updated };
        case "delete":
          const deleted = await ModelClass.findOneAndDelete(filter);
          return { success: true, data: deleted };
        case "aggregate":
          const aggregateResults = await ModelClass.aggregate(data);
          return { success: true, data: aggregateResults };
        default:
          throw new Error(`Action ${action} not supported`);
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private getModelByName(modelName: string): any {
    const modelMap = {
      User: models.User,
      Conversation: models.Conversation,
      Message: models.Message,
      ResumeAnalysis: models.ResumeAnalysis,
      CareerPlan: models.CareerPlan,
      LearningRoadmap: models.LearningRoadmap,
      JobRecommendation: models.JobRecommendation,
      SavedJob: models.SavedJob,
      ActivityLog: models.ActivityLog,
      Document: models.Document,
      Notification: models.Notification,
      Job: models.Job,
      Application: models.Application,
      BlogPost: models.BlogPost,
    };
    const model = modelMap[modelName as keyof typeof modelMap];
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }
    return model;
  }
}
