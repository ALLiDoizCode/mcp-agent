import { z } from 'zod';
import { BaseLLMProvider, LLMResponse } from './base.js';
import {
  AnthropicRequest,
  AnthropicResponse,
  AnthropicErrorResponse,
  AnthropicMessage,
  AnthropicTool,
} from './anthropic-types.js';

export interface AnthropicConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string;
}

export class AnthropicProvider extends BaseLLMProvider {
  readonly name = 'anthropic';
  private config: Required<AnthropicConfig>;
  
  constructor(config: AnthropicConfig) {
    super();
    this.config = {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 4000,
      baseURL: 'https://api.anthropic.com/v1',
      ...config
    };
  }
  
  async generate(prompt: string): Promise<LLMResponse> {
    return this.generateWithTools(prompt, []);
  }
  
  async generateWithTools(prompt: string, tools: any[] = []): Promise<LLMResponse> {
    try {
      const messages: AnthropicMessage[] = [
        {
          role: 'user',
          content: prompt
        }
      ];
      
      const requestBody: AnthropicRequest = {
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        messages,
        temperature: this.config.temperature,
      };
      
      // Add tools if provided
      if (tools && tools.length > 0) {
        requestBody.tools = tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          input_schema: tool.parameters
        })) as AnthropicTool[];
      }
      
      const response = await fetch(`${this.config.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `Anthropic API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText) as AnthropicErrorResponse;
          errorMessage = `Anthropic API error: ${errorData.error.message}`;
        } catch {
          // Use default error message if parsing fails
        }
        throw new Error(errorMessage);
      }
      
      const data = JSON.parse(responseText) as AnthropicResponse;
      
      // Extract text content and tool calls
      let content = '';
      const toolCalls: Array<{name: string, parameters: any}> = [];
      
      for (const item of data.content) {
        if (item.type === 'text' && item.text) {
          content += item.text;
        } else if (item.type === 'tool_use' && item.name && item.input) {
          toolCalls.push({
            name: item.name,
            parameters: item.input
          });
        }
      }
      
      return {
        content,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Anthropic generation failed: ${String(error)}`);
    }
  }
  
  async generateStructured<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> {
    try {
      // Use tool calling to get structured output
      const tool = {
        name: 'structured_output',
        description: 'Return structured data according to the schema',
        input_schema: schema._def
      };
      
      const response = await this.generateWithTools(
        `${prompt}\n\nPlease respond using the structured_output function with the required data.`,
        [tool]
      );
      
      if (response.toolCalls && response.toolCalls.length > 0) {
        const toolCall = response.toolCalls[0];
        if (toolCall.name === 'structured_output') {
          return schema.parse(toolCall.parameters);
        }
      }
      
      // Fallback: try to parse response content as JSON
      try {
        const parsed = JSON.parse(response.content);
        return schema.parse(parsed);
      } catch {
        throw new Error('Failed to get structured output from Anthropic');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Anthropic structured generation failed: ${String(error)}`);
    }
  }
}