import { BaseTool, ToolResult } from "./base";
import pdfParse from "pdf-parse";
import fs from "fs";
import { ResumeAnalysis, User } from "../models";
import geminiService from "../services/gemini";

export class ResumeTool extends BaseTool {
  name = "resume";
  description = "Analyze resumes using PDF text extraction and Gemini AI for ATS scoring";

  async execute(parameters: any): Promise<ToolResult> {
    try {
      const { resumeUrl, filename, userId, targetRole } = parameters;

      if (!fs.existsSync(resumeUrl)) {
        return { success: false, error: "Uploaded file not found on server" };
      }

      const pdfData = fs.readFileSync(resumeUrl);
      const pdfContent = await pdfParse(pdfData);
      const text = pdfContent.text || "";

      if (text.trim().length < 50) {
        return { success: false, error: "Could not extract readable text from the PDF" };
      }

      const user: any = await User.findById(userId).lean();
      const userSkills = (user?.skills || []).join(", ");

      const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer and career coach.
Analyze the following resume text and return a rigorous, structured assessment.

RESUME TEXT:
"""
${text.slice(0, 12000)}
"""

CANDIDATE SKILLS ON PROFILE: ${userSkills || "not provided"}
TARGET ROLE (if any): ${targetRole || "general"}

Return ONLY valid JSON with this exact shape:
{
  "score": <number 0-100 overall quality score>,
  "atsScore": <number 0-100 ATS compatibility score>,
  "keywordScore": <number 0-100 keyword optimization score>,
  "readabilityScore": <number 0-100 readability score>,
  "strengths": [<string>, ... up to 6],
  "weaknesses": [<string>, ... up to 6],
  "missingSkills": [<string>, ... skills the candidate lacks for their target role],
  "suggestions": [<string>, ... up to 6 concrete improvement actions],
  "formattingIssues": [<string>, ...],
  "contentIssues": [<string>, ...],
  "summary": <string one-paragraph summary>
}`;

      const analysis = await geminiService.generateJSON(prompt, {
        temperature: 0.4,
        maxOutputTokens: 4096,
        systemInstruction:
          "You are a meticulous resume analyst. Always respond with valid JSON only.",
      });

      const normalized = {
        score: Number(analysis.score) || 0,
        atsScore: Number(analysis.atsScore) || 0,
        keywordScore: Number(analysis.keywordScore) || 0,
        readabilityScore: Number(analysis.readabilityScore) || 0,
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
        weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
        missingSkills: Array.isArray(analysis.missingSkills) ? analysis.missingSkills : [],
        suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions : [],
        formattingIssues: Array.isArray(analysis.formattingIssues) ? analysis.formattingIssues : [],
        contentIssues: Array.isArray(analysis.contentIssues) ? analysis.contentIssues : [],
        summary: analysis.summary || "",
      };

      const newAnalysis = new ResumeAnalysis({
        userId,
        filename,
        originalUrl: resumeUrl,
        analysis: normalized,
      });

      await newAnalysis.save();

      // cleanup uploaded file
      try {
        fs.unlinkSync(resumeUrl);
      } catch {
        // ignore cleanup errors
      }

      return { success: true, data: newAnalysis, extractedText: text };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
