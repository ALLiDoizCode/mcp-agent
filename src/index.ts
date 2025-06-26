// Core classes
export { AugmentedLLM } from './core/augmented-llm.js';
export { Agent, type AgentConfig } from './core/agent.js';

// Providers
export { OpenAIProvider, type OpenAIConfig } from './providers/openai.js';
export { AnthropicProvider, type AnthropicConfig } from './providers/anthropic.js';
export { BaseLLMProvider, type LLMProvider, type LLMResponse } from './providers/base.js';

// Tools
export { 
  ToolRegistry,
  BaseTool,
  type Tool,
  type ToolResult,
  ReadFileTool,
  WriteFileTool,
  ListDirectoryTool,
  WebSearchTool,
  WebFetchTool,
  ShellCommandTool,
  NodeScriptTool,
  HttpRequestTool
} from './tools/index.js';

// Types
export type {
  Memory,
  ToolCall,
  LLMUsage,
  ModelCapabilities,
  AgentMetrics,
  WorkflowStep,
  Workflow,
  AgentEvent
} from './types/index.js';

// Provider types
export type {
  OpenAIMessage,
  OpenAIToolCall,
  OpenAIChatCompletionRequest,
  OpenAIChatCompletionResponse,
  OpenAIUsage,
  OpenAIChoice
} from './providers/openai-types.js';

export type {
  AnthropicMessage,
  AnthropicContent,
  AnthropicRequest,
  AnthropicResponse,
  AnthropicUsage
} from './providers/anthropic-types.js';