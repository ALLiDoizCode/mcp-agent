export interface LLMResponse {
  content: string;
  toolCalls?: Array<{
    name: string;
    parameters: any;
  }>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  readonly name: string;
  generate(prompt: string): Promise<LLMResponse>;
  generateWithTools(prompt: string, tools: any[]): Promise<LLMResponse>;
  generateStructured<T>(prompt: string, schema: any): Promise<T>;
  embedText?(text: string): Promise<number[]>;
}

export abstract class BaseLLMProvider implements LLMProvider {
  abstract readonly name: string;
  
  abstract generate(prompt: string): Promise<LLMResponse>;
  abstract generateWithTools(prompt: string, tools: any[]): Promise<LLMResponse>;
  abstract generateStructured<T>(prompt: string, schema: any): Promise<T>;
  
  // Optional embedding support
  async embedText(text: string): Promise<number[]> {
    throw new Error(`${this.name} provider does not support text embeddings`);
  }
}