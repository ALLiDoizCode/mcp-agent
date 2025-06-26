import { z } from 'zod';
import { BaseTool, ToolResult } from './base.js';

export class HttpRequestTool extends BaseTool {
  name = 'http_request';
  description = 'Make HTTP requests';
  parameters = z.object({
    url: z.string().url(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
    headers: z.record(z.string()).optional(),
    body: z.string().optional(),
    timeout: z.number().default(10000),
  });

  async execute(params: any): Promise<ToolResult> {
    const { url, method, headers, body, timeout } = this.validateParams(params);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const requestInit: RequestInit = {
        method,
        signal: controller.signal,
        headers: {
          'User-Agent': 'mcp-agent-ts/1.0',
          'Content-Type': 'application/json',
          ...headers,
        },
      };
      
      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        requestInit.body = body;
      }
      
      const response = await fetch(url, requestInit);
      clearTimeout(timeoutId);
      
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }
      
      return {
        success: true,
        data: { 
          data, 
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        },
        metadata: { url, method }
      };
    } catch (error) {
      return {
        success: false,
        error: `HTTP request failed: ${this.getErrorMessage(error)}`,
        metadata: { url, method }
      };
    }
  }
}