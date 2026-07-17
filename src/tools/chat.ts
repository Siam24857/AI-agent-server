import { BaseTool, ToolResult } from "./base";
import geminiService from "../services/gemini";
import { User } from "../models";

const SYSTEM_PROMPT = `You are "CareerAI", an intelligent career mentor assistant inside the AI Career Mentor platform.
You help users with: resume improvement, job search strategy, interview preparation, skill roadmaps,
career transitions, and using the platform's features (resume analyzer, job recommendations, interview practice, learning roadmaps).

Guidelines:
- Be supportive, specific, and actionable.
- Use the candidate's profile context when relevant.
- Keep responses concise but thorough.
- If you don't know something factual, say so and suggest next steps.`;

export class ChatTool extends BaseTool {
  name = "chat";
  description = "Conversational AI career assistant with memory of conversation history";

  async execute(parameters: any): Promise<ToolResult> {
    try {
      const { userId, message, history = [], targetRole } = parameters;

      const user: any = await User.findById(userId).lean();
      const profileSnippet = user
        ? `Candidate profile -> Name: ${user.fullname}, Skills: ${(user.skills || []).join(", ") || "none"}, Experience: ${(user.experience || []).join(", ") || "none"}, Target role: ${targetRole || "not specified"}.`
        : "";

      const contextPrompt = `${profileSnippet ? profileSnippet + "\n\n" : ""}Continue the conversation as CareerAI.`;

      const fullPrompt = `${contextPrompt}

CONVERSATION HISTORY:
${
  history
    .map((m: any) => `${m.role === "user" ? "User" : "CareerAI"}: ${m.content}`)
    .join("\n") || "(no history)"
}

User: ${message}

CareerAI:`;

      const reply = await geminiService.generate(fullPrompt, {
        temperature: 0.8,
        maxOutputTokens: 2048,
        systemInstruction: SYSTEM_PROMPT,
      });

      return { success: true, data: { content: reply } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async stream(parameters: any, onChunk: (text: string) => void): Promise<string> {
    const { userId, message, history = [], targetRole } = parameters;
    const user: any = await User.findById(userId).lean();
    const profileSnippet = user
      ? `Candidate profile -> Name: ${user.fullname}, Skills: ${(user.skills || []).join(", ") || "none"}, Experience: ${(user.experience || []).join(", ") || "none"}, Target role: ${targetRole || "not specified"}.`
      : "";

    const contextPrompt = `${profileSnippet ? profileSnippet + "\n\n" : ""}Continue the conversation as CareerAI.`;
    const fullPrompt = `${contextPrompt}

CONVERSATION HISTORY:
${
  history
    .map((m: any) => `${m.role === "user" ? "User" : "CareerAI"}: ${m.content}`)
    .join("\n") || "(no history)"
}

User: ${message}

CareerAI:`;

    return geminiService.generateStream(fullPrompt, onChunk, {
      temperature: 0.8,
      maxOutputTokens: 2048,
      systemInstruction: SYSTEM_PROMPT,
    });
  }
}
