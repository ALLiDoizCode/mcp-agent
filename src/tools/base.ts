import { z } from 'zod';

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface Tool {
  name: string;
  description: string;
  parameters: z.ZodSchema;
  execute(params: any): Promise<ToolResult>;
}

export abstract class BaseTool implements Tool {
  abstract name: string;
  abstract description: string;
  abstract parameters: z.ZodSchema;
  
  abstract execute(params: any): Promise<ToolResult>;
  
  protected validateParams(params: any): any {
    try {
      return this.parameters.parse(params);
    } catch (error) {
      throw new Error(`Invalid parameters: ${this.getErrorMessage(error)}`);
    }
  }
  
  protected getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error occurred';
  }
}