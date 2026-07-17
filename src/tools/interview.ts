import { BaseTool, ToolResult } from "./base";
import geminiService from "../services/gemini";

export class InterviewTool extends BaseTool {
  name = "interview";
  description = "Generate AI interview questions and evaluate candidate answers";

  async execute(parameters: any): Promise<ToolResult> {
    try {
      const { action = "generate", difficulty = "medium", type = "technical", count = 5, role, question, answer } = parameters;

      if (action === "evaluate") {
        const prompt = `You are an expert technical interviewer.
Evaluate the candidate's answer to the interview question below.

QUESTION: ${question}
CANDIDATE ANSWER: ${answer}

Return ONLY valid JSON:
{
  "score": <number 0-100>,
  "feedback": <string constructive feedback>,
  "strengths": [<string>, ...],
  "improvements": [<string>, ...],
  "modelAnswer": <string a strong example answer>
}`;
        const result = await geminiService.generateJSON(prompt, {
          temperature: 0.4,
          maxOutputTokens: 2048,
          systemInstruction: "You are a fair, rigorous interviewer. Respond with valid JSON only.",
        });
        return { success: true, data: result };
      }

      const prompt = `You are an expert hiring manager.
Generate ${count} ${difficulty} difficulty ${type} interview questions${role ? ` for a ${role} position` : ""}.

Return ONLY valid JSON: an array of objects:
{
  "id": <number>,
  "question": <string>,
  "category": <"technical"|"behavioral"|"hr">,
  "expectedPoints": [<string>, ... key points a good answer should cover]
}`;
      const questions = await geminiService.generateJSON<any[]>(prompt, {
        temperature: 0.8,
        maxOutputTokens: 3072,
        systemInstruction: "You are a seasoned interviewer. Respond with valid JSON only.",
      });
      return { success: true, data: questions || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
