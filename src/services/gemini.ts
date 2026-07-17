import { GoogleGenAI } from "@google/genai";
import config from "../config/config";

const apiKey = process.env.GEMINI_API_KEY || config.gemini?.apiKey || "";

if (!apiKey) {
  // eslint-disable-next-line no-console
  console.warn("[Gemini] No API key configured. AI features will return errors.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const DEFAULT_MODEL = process.env.GEMINI_MODEL || config.gemini?.model || "gemini-2.5-flash";

function extractText(response: any): string {
  if (!response) return "";
  if (typeof response.text === "function") {
    try {
      return response.text() || "";
    } catch {
      // ignore
    }
  }
  if (typeof response.text === "string") return response.text;
  if (response.candidates?.[0]?.content?.parts) {
    return response.candidates[0].content.parts
      .map((p: any) => p.text || "")
      .join("");
  }
  return "";
}

function stripCodeFences(text: string): string {
  let t = text.trim();
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fence) t = fence[1].trim();
  return t;
}

export interface GeminiOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  json?: boolean;
  systemInstruction?: string;
}

export const geminiService = {
  isConfigured(): boolean {
    return !!ai;
  },

  async generate(prompt: string, options: GeminiOptions = {}): Promise<string> {
    if (!ai) {
      throw new Error("Gemini API is not configured (missing GEMINI_API_KEY).");
    }
    const model = options.model || DEFAULT_MODEL;
    const configParams: any = {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 8192,
    };
    if (options.json) {
      configParams.responseMimeType = "application/json";
    }
    if (options.systemInstruction) {
      configParams.systemInstruction = options.systemInstruction;
    }
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: configParams,
    });
    return extractText(response);
  },

  async generateJSON<T = any>(prompt: string, options: GeminiOptions = {}): Promise<T> {
    const raw = await this.generate(prompt, { ...options, json: true });
    const cleaned = stripCodeFences(raw);
    try {
      return JSON.parse(cleaned) as T;
    } catch (e) {
      throw new Error("Failed to parse AI response as JSON: " + cleaned.slice(0, 200));
    }
  },

  async generateStream(
    prompt: string,
    onChunk: (text: string) => void,
    options: GeminiOptions = {}
  ): Promise<string> {
    if (!ai) {
      throw new Error("Gemini API is not configured (missing GEMINI_API_KEY).");
    }
    const model = options.model || DEFAULT_MODEL;
    const configParams: any = {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 8192,
    };
    if (options.systemInstruction) {
      configParams.systemInstruction = options.systemInstruction;
    }
    const stream = await ai.models.generateContentStream({
      model,
      contents: prompt,
      config: configParams,
    });
    let full = "";
    for await (const chunk of stream) {
      const t = extractText(chunk);
      if (t) {
        full += t;
        onChunk(t);
      }
    }
    return full;
  },
};

export default geminiService;
