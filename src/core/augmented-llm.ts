import { LLMProvider, LLMResponse } from '../providers/base.js';
import { Memory } from '../types/index.js';

export class AugmentedLLM {
  private provider: LLMProvider;
  private memories: Memory[] = [];
  private maxMemories: number = 100;

  constructor(provider: LLMProvider) {
    this.provider = provider;
  }

  async generateResponse(prompt: string, tools?: any[]): Promise<LLMResponse> {
    const contextualPrompt = this.buildContextualPrompt(prompt);
    
    if (tools && tools.length > 0) {
      return await this.provider.generateWithTools(contextualPrompt, tools);
    } else {
      return await this.provider.generate(contextualPrompt);
    }
  }

  async generateStructured<T>(prompt: string, schema: any): Promise<T> {
    const contextualPrompt = this.buildContextualPrompt(prompt);
    return await this.provider.generateStructured(contextualPrompt, schema);
  }

  async addMemory(memory: Memory): Promise<void> {
    this.memories.push(memory);
    
    // Trim memories if we exceed the limit
    if (this.memories.length > this.maxMemories) {
      this.memories = this.memories.slice(-this.maxMemories);
    }
  }

  getRecentMemories(count: number = 10): Memory[] {
    return this.memories.slice(-count);
  }

  clearMemories(): void {
    this.memories = [];
  }

  getMemoryCount(): number {
    return this.memories.length;
  }

  private buildContextualPrompt(prompt: string): string {
    const recentMemories = this.getRecentMemories(5);
    
    if (recentMemories.length === 0) {
      return prompt;
    }

    const memoryContext = recentMemories
      .map(memory => `${memory.role}: ${memory.content}`)
      .join('\n');

    return `Previous context:\n${memoryContext}\n\nCurrent request: ${prompt}`;
  }

  getProvider(): LLMProvider {
    return this.provider;
  }

  getProviderName(): string {
    return this.provider.name;
  }
}