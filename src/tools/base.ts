export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  count?: number;
  extractedText?: string;
}

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;

  abstract execute(parameters: any): Promise<ToolResult>;
}
