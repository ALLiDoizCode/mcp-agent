import { AugmentedLLM } from './augmented-llm.js';
import { ToolRegistry, ToolResult } from '../tools/index.js';
import { Memory } from '../types/index.js';

export interface AgentConfig {
  name: string;
  instructions: string;
  llm: AugmentedLLM;
  tools?: string[];
  maxIterations?: number;
}

export class Agent {
  private name: string;
  private instructions: string;
  private llm: AugmentedLLM;
  private toolRegistry: ToolRegistry;
  private enabledTools: Set<string>;
  private maxIterations: number;
  private iterationCount: number = 0;

  constructor(config: AgentConfig) {
    this.name = config.name;
    this.instructions = config.instructions;
    this.llm = config.llm;
    this.toolRegistry = new ToolRegistry();
    this.enabledTools = new Set(config.tools || []);
    this.maxIterations = config.maxIterations || 10;
  }

  async run(input: string): Promise<string> {
    this.iterationCount = 0;
    
    // Add user input to memory
    await this.updateMemory({
      role: 'user',
      content: input,
      timestamp: Date.now(),
    });

    let currentInput = input;
    let shouldContinue = true;

    while (shouldContinue && this.iterationCount < this.maxIterations) {
      this.iterationCount++;
      
      const response = await this.llm.generateResponse(
        this.buildPrompt(currentInput),
        this.getAvailableTools()
      );

      // Check if LLM wants to use tools
      if (response.toolCalls && response.toolCalls.length > 0) {
        const toolResults = await this.executeToolCalls(response.toolCalls);
        
        // Add tool results to context for next iteration
        currentInput = this.formatToolResults(toolResults);
        
        // Continue if tools were used
        shouldContinue = true;
      } else {
        // No tools used, we have final response
        await this.updateMemory({
          role: 'assistant',
          content: response.content,
          timestamp: Date.now(),
        });
        
        return response.content;
      }
    }

    throw new Error(`Agent reached max iterations (${this.maxIterations})`);
  }

  private buildPrompt(input: string): string {
    const recentMemories = this.llm.getRecentMemories(10);
    const memoryContext = recentMemories
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    return `${this.instructions}

Recent conversation:
${memoryContext}

Available tools:
${this.getToolDescriptions()}

Current request: ${input}

Think step by step. If you need to use tools, specify them clearly. If you have enough information to provide a final answer, do so.`;
  }

  private getAvailableTools() {
    const allTools = this.toolRegistry.list();
    return allTools.filter(tool => 
      this.enabledTools.size === 0 || this.enabledTools.has(tool.name)
    );
  }

  private getToolDescriptions(): string {
    return this.getAvailableTools()
      .map(tool => `- ${tool.name}: ${tool.description}`)
      .join('\n');
  }

  private async executeToolCalls(toolCalls: Array<{name: string, parameters: any}>): Promise<ToolResult[]> {
    const results: ToolResult[] = [];
    
    for (const call of toolCalls) {
      try {
        const result = await this.toolRegistry.executeTool(call.name, call.parameters);
        results.push(result);
        
        // Add tool execution to memory
        await this.updateMemory({
          role: 'system',
          content: `Tool ${call.name} executed: ${result.success ? 'Success' : 'Failed'}`,
          timestamp: Date.now(),
          metadata: { toolCall: call, result }
        });
      } catch (error) {
        const errorResult: ToolResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata: { toolCall: call }
        };
        results.push(errorResult);
      }
    }
    
    return results;
  }

  private formatToolResults(results: ToolResult[]): string {
    return results
      .map((result, index) => {
        if (result.success) {
          return `Tool ${index + 1} succeeded: ${JSON.stringify(result.data, null, 2)}`;
        } else {
          return `Tool ${index + 1} failed: ${result.error}`;
        }
      })
      .join('\n\n');
  }

  private async updateMemory(memory: Memory): Promise<void> {
    await this.llm.addMemory(memory);
  }

  // Tool management methods
  enableTool(toolName: string): void {
    this.enabledTools.add(toolName);
  }

  disableTool(toolName: string): void {
    this.enabledTools.delete(toolName);
  }

  enableAllTools(): void {
    this.enabledTools.clear();
  }

  getEnabledTools(): string[] {
    return Array.from(this.enabledTools);
  }

  getName(): string {
    return this.name;
  }

  getInstructions(): string {
    return this.instructions;
  }
}