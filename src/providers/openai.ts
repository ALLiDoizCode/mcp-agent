import { z } from 'zod';
import { BaseLLMProvider, LLMResponse } from './base.js';
import {
  OpenAIChatCompletionRequest,
  OpenAIChatCompletionResponse,
  OpenAIEmbeddingRequest,
  OpenAIEmbeddingResponse,
  OpenAIErrorResponse,
  OpenAIMessage,
  OpenAITool,
} from './openai-types.js';

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string;
}

export class OpenAIProvider extends BaseLLMProvider {
  readonly name = 'openai';
  private config: Required<OpenAIConfig>;
  
  constructor(config: OpenAIConfig) {
    super();
    this.config = {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 4000,
      baseURL: 'https://api.openai.com/v1',
      ...config
    };
  }
  
  async generate(prompt: string): Promise<LLMResponse> {
    return this.generateWithTools(prompt, []);
  }
  
  async generateWithTools(prompt: string, tools: any[] = []): Promise<LLMResponse> {
    try {
      const messages: OpenAIMessage[] = [
        {
          role: 'user',
          content: prompt
        }
      ];
      
      const requestBody: OpenAIChatCompletionRequest = {
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      };
      
      // Add tools if provided
      if (tools && tools.length > 0) {
        requestBody.tools = tools.map(tool => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
          }
        })) as OpenAITool[];
        requestBody.tool_choice = 'auto';
      }
      
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText) as OpenAIErrorResponse;
          errorMessage = `OpenAI API error: ${errorData.error.message}`;
        } catch {
          // Use default error message if parsing fails
        }
        throw new Error(errorMessage);
      }
      
      const data = JSON.parse(responseText) as OpenAIChatCompletionResponse;
      const choice = data.choices[0];
      
      if (!choice) {
        throw new Error('No response choices returned from OpenAI');
      }
      
      // Handle tool calls if present
      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        return {
          content: choice.message.content || '',
          toolCalls: choice.message.tool_calls.map(call => ({
            name: call.function.name,
            parameters: JSON.parse(call.function.arguments)
          })),
          usage: {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        };
      }
      
      return {
        content: choice.message.content || '',
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`OpenAI generation failed: ${String(error)}`);
    }
  }
  
  async generateStructured<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> {
    try {
      // Use function calling to get structured output
      const tool = {
        name: 'structured_output',
        description: 'Return structured data according to the schema',
        parameters: schema._def
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
        throw new Error('Failed to get structured output from OpenAI');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`OpenAI structured generation failed: ${String(error)}`);
    }
  }
  
  async embedText(text: string): Promise<number[]> {
    try {
      const requestBody: OpenAIEmbeddingRequest = {
        model: 'text-embedding-3-small',
        input: text,
      };
      
      const response = await fetch(`${this.config.baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText) as OpenAIErrorResponse;
          errorMessage = `OpenAI API error: ${errorData.error.message}`;
        } catch {
          // Use default error message if parsing fails
        }
        throw new Error(errorMessage);
      }
      
      const data = JSON.parse(responseText) as OpenAIEmbeddingResponse;
      
      if (!data.data || data.data.length === 0) {
        throw new Error('No embedding data returned from OpenAI');
      }
      
      return data.data[0].embedding;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`OpenAI embedding failed: ${String(error)}`);
    }
  }
}