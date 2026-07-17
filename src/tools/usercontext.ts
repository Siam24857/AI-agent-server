import { BaseTool, ToolResult } from "./base";
import { UserContext } from "../models";

export class UserContextTool extends BaseTool {
  name = "usercontext";
  description = "Retrieve and update user context for personalized AI interactions";

  async execute(parameters: any): Promise<ToolResult> {
    try {
      const { userId, context } = parameters;

      if (context) {
        let userContext = await UserContext.findOne({ userId });
        if (!userContext) {
          userContext = new UserContext({ userId, context: {} });
        }
        userContext.context = { ...userContext.context, ...context };
        userContext.lastUpdated = new Date();
        await userContext.save();
        return { success: true, data: userContext };
      } else {
        const userContext = await UserContext.findOne({ userId }).populate("userId");
        return { success: true, data: userContext };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}
