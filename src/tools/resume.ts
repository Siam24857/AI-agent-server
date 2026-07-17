import { BaseTool, ToolResult } from "./base";
import pdfParse from "pdf-parse";
import fs from "fs";
import { ResumeAnalysis } from "../models";

export class ResumeTool extends BaseTool {
  name = "resume";
  description = "Analyze resumes using PDF text extraction and NLP";

  async execute(parameters: any): Promise<ToolResult> {
    try {
      const { resumeUrl, filename, userId } = parameters;

      const pdfData = fs.readFileSync(resumeUrl);
      const pdfContent = await pdfParse(pdfData);

      const text = pdfContent.text;

      const analysis = {
        score: 0,
        atsScore: 0,
        strengths: [],
        weaknesses: [],
        missingSkills: [],
        suggestions: [],
        keywordScore: 0,
        readabilityScore: 0,
        formattingIssues: [],
        contentIssues: [],
      };

      const newAnalysis = new ResumeAnalysis({
        userId,
        filename,
        originalUrl: resumeUrl,
        analysis,
      });

      await newAnalysis.save();

      return { success: true, data: newAnalysis, extractedText: text };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}
