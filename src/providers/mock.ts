import { BaseLLMProvider } from './base.js';
import { Message, Tool, RequestParams } from '../types/index.js';

export interface MockConfig {
  apiKey?: string;
  responses?: string[];
  delay?: number;
}

// Type guard for schema properties
interface SchemaProperty {
  type?: string;
  [key: string]: any;
}

export class MockProvider extends BaseLLMProvider {
  public name = 'Mock';
  private responses: string[];
  private responseIndex = 0;
  private delay: number;

  constructor(config: MockConfig = {}) {
    super({ apiKey: config.apiKey || 'mock-key' });
    this.responses = config.responses || [
      'This is a mock response from the Mock LLM provider.',
      'Another mock response to simulate conversation.',
      'Mock provider can return predefined responses for testing.'
    ];
    this.delay = config.delay || 100; // Small delay to simulate API calls
  }

  async generate(messages: Message[], params?: RequestParams): Promise<Message> {
    await this.simulateDelay();
    
    const response = this.getNextResponse();
    const lastMessage = messages[messages.length - 1];
    
    // Simple mock logic based on input
    let content = response;
    if (lastMessage?.content.toLowerCase().includes('hello')) {
      content = 'Hello! I\'m a mock LLM provider. How can I help you today?';
    } else if (lastMessage?.content.toLowerCase().includes('code')) {
      content = 'Here\'s some mock code:\n```javascript\nconsole.log("Hello from mock provider!");\n```';
    }

    return {
      role: 'assistant',
      content,
      metadata: {
        model: 'mock-model-v1',
        provider: 'Mock',
        responseIndex: this.responseIndex - 1
      }
    };
  }

  async generateWithTools(messages: Message[], tools: Tool[], params?: RequestParams): Promise<Message> {
    await this.simulateDelay();
    
    const lastMessage = messages[messages.length - 1];
    
    // Simulate tool calling for specific inputs
    if (lastMessage?.content.toLowerCase().includes('search') && tools.some(t => t.name.includes('search'))) {
      return {
        role: 'assistant',
        content: 'I need to search for that information.',
        metadata: {
          model: 'mock-model-v1',
          provider: 'Mock',
          toolCalls: [{
            id: 'mock-call-1',
            name: tools.find(t => t.name.includes('search'))?.name || 'search',
            parameters: { query: 'mock search query' }
          }]
        }
      };
    }

    // Default response without tools
    return this.generate(messages, params);
  }

  async generateStructured<T>(messages: Message[], schema: any, params?: RequestParams): Promise<T> {
    await this.simulateDelay();
    
    // Return mock structured data based on schema type
    if (schema.type === 'object' && schema.properties) {
      const mockData: any = {};
      
      // Type-safe iteration over schema properties
      for (const [key, propValue] of Object.entries(schema.properties)) {
        const prop = propValue as SchemaProperty;
        
        if (this.isSchemaProperty(prop)) {
          if (prop.type === 'string') {
            mockData[key] = `mock-${key}`;
          } else if (prop.type === 'number') {
            mockData[key] = 42;
          } else if (prop.type === 'boolean') {
            mockData[key] = true;
          } else if (prop.type === 'array') {
            mockData[key] = ['mock-item-1', 'mock-item-2'];
          } else {
            mockData[key] = `mock-${key}-value`;
          }
        } else {
          mockData[key] = `mock-${key}-default`;
        }
      }
      
      return mockData as T;
    }

    // Fallback for other schema types
    return { result: 'mock structured response' } as T;
  }

  // Type guard to check if object has the expected schema property structure
  private isSchemaProperty(obj: any): obj is SchemaProperty {
    return obj && typeof obj === 'object' && 'type' in obj;
  }

  private getNextResponse(): string {
    const response = this.responses[this.responseIndex % this.responses.length];
    this.responseIndex++;
    return response;
  }

  private async simulateDelay(): Promise<void> {
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }
  }

  // Add custom responses for testing
  addResponse(response: string): void {
    this.responses.push(response);
  }

  // Reset response index
  resetResponses(): void {
    this.responseIndex = 0;
  }
}
