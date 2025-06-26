import { BaseLLMProvider, LLMResponse } from './base.js';

export interface MockConfig {
  apiKey?: string;
  delay?: number;
}

export class MockProvider extends BaseLLMProvider {
  readonly name = 'mock';
  private config: MockConfig;
  
  constructor(config: MockConfig = {}) {
    super();
    this.config = {
      delay: 100,
      ...config
    };
  }
  
  async generate(prompt: string): Promise<LLMResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, this.config.delay));
    
    return {
      content: `Mock response to: "${prompt.substring(0, 50)}..."`
    };
  }
  
  async generateWithTools(prompt: string, tools: any[]): Promise<LLMResponse> {
    await new Promise(resolve => setTimeout(resolve, this.config.delay));
    
    // Simulate tool usage for certain prompts
    if (prompt.toLowerCase().includes('file') || prompt.toLowerCase().includes('create')) {
      return {
        content: '',
        toolCalls: [{
          name: 'write_file',
          parameters: {
            filepath: './mock-file.txt',
            content: 'Mock file content'
          }
        }]
      };
    }
    
    return {
      content: `Mock response with ${tools.length} tools available: "${prompt.substring(0, 50)}..."`
    };
  }
  
  async generateStructured<T>(prompt: string, schema: any): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, this.config.delay));
    
    return { 
      mockStructuredResponse: true,
      prompt: prompt.substring(0, 50) + '...'
    } as T;
  }
}