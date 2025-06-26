export interface Memory {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ToolCall {
  name: string;
  parameters: any;
}

export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ModelCapabilities {
  supportsTools: boolean;
  supportsStreaming: boolean;
  supportsEmbeddings: boolean;
  maxTokens: number;
  contextWindow: number;
}

export interface AgentMetrics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageRunTime: number;
  toolUsageCount: Record<string, number>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  agent?: string;
  tools?: string[];
  dependencies?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export interface AgentEvent {
  type: 'start' | 'tool_call' | 'response' | 'error' | 'complete';
  timestamp: number;
  data: any;
  agentName: string;
}

// Re-export commonly used types
export type { ToolResult, Tool } from '../tools/base.js';