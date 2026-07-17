import { BaseTool, ToolResult } from "./base";

export class InterviewTool extends BaseTool {
  name = "interview";
  description = "Generate interview questions and assessments";

  async execute(parameters: any): Promise<ToolResult> {
    try {
      const { difficulty = "medium", type = "technical", count = 5 } = parameters;

      const questions: Record<string, string[]> = {
        technical: [
          "Explain the difference between REST and GraphQL APIs",
          "How does garbage collection work in JavaScript?",
          "What are design patterns and when should they be used?",
          "Explain the concept of microservices architecture",
          "How do you optimize database queries for performance?",
        ].slice(0, count),
        behavioral: [
          "Tell me about a challenging project you've worked on and how you handled it.",
          "How do you handle tight deadlines and competing priorities?",
          "Describe a situation where you had to work with a difficult team member.",
          "What motivates you to do your best work?",
          "How do you stay updated with the latest technology trends?",
        ].slice(0, count),
        hr: [
          "Why do you want to work at our company?",
          "Where do you see yourself in 5 years?",
          "What are your greatest strengths and weaknesses?",
          "How do you handle failure or rejection?",
          "Give me an example of a time you showed leadership.",
        ].slice(0, count),
      };

      return { success: true, data: questions[type] || questions.technical };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}
