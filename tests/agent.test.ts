import { Agent } from '../src/core/agent';
import { AugmentedLLM } from '../src/core/augmented-llm';
import { OpenAIProvider } from '../src/providers/openai';
import { ToolRegistry } from '../src/tools/index';

describe('Agent Integration Tests', () => {
  let agent: Agent;
  let provider: OpenAIProvider;
  let llm: AugmentedLLM;
  
  beforeEach(() => {
    provider = new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY || 'test-key',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
    });
    
    llm = new AugmentedLLM(provider);
    
    agent = new Agent({
      name: 'TestAgent',
      instructions: 'You are a helpful assistant that can use tools to complete tasks.',
      llm,
      tools: ['read_file', 'write_file', 'web_search'],
      maxIterations: 5,
    });
  });

  test('should create agent with tools', () => {
    expect(agent).toBeDefined();
    expect(agent.getName()).toBe('TestAgent');
    expect(agent.getEnabledTools()).toEqual(['read_file', 'write_file', 'web_search']);
  });

  test('should enable/disable tools', () => {
    agent.disableTool('web_search');
    expect(agent.getEnabledTools()).toEqual(['read_file', 'write_file']);
    
    agent.enableTool('web_search');
    expect(agent.getEnabledTools()).toContain('web_search');
    
    agent.enableAllTools();
    expect(agent.getEnabledTools()).toEqual([]);
  });

  test('should have correct instructions', () => {
    expect(agent.getInstructions()).toBe('You are a helpful assistant that can use tools to complete tasks.');
  });
});

describe('ToolRegistry Tests', () => {
  let toolRegistry: ToolRegistry;

  beforeEach(() => {
    toolRegistry = new ToolRegistry();
  });

  test('should initialize with default tools', () => {
    const tools = toolRegistry.list();
    expect(tools.length).toBeGreaterThan(0);
    
    const toolNames = toolRegistry.getAvailableToolNames();
    expect(toolNames).toContain('read_file');
    expect(toolNames).toContain('write_file');
    expect(toolNames).toContain('web_search');
    expect(toolNames).toContain('web_fetch');
    expect(toolNames).toContain('shell_command');
    expect(toolNames).toContain('http_request');
  });

  test('should get tool schemas', () => {
    const schemas = toolRegistry.getToolSchemas();
    expect(Array.isArray(schemas)).toBe(true);
    expect(schemas.length).toBeGreaterThan(0);
    
    const readFileSchema = schemas.find(s => s.name === 'read_file');
    expect(readFileSchema).toBeDefined();
    expect(readFileSchema?.description).toBe('Read contents of a file');
  });

  test('should handle tool not found', async () => {
    await expect(
      toolRegistry.executeTool('nonexistent_tool', {})
    ).rejects.toThrow("Tool 'nonexistent_tool' not found");
  });
});

describe('Provider Tests', () => {
  test('should create OpenAI provider', () => {
    const provider = new OpenAIProvider({
      apiKey: 'test-key',
      model: 'gpt-4',
    });
    
    expect(provider).toBeDefined();
    expect(provider.name).toBe('openai');
  });

  test('should create AugmentedLLM', () => {
    const provider = new OpenAIProvider({
      apiKey: 'test-key',
      model: 'gpt-4',
    });
    
    const llm = new AugmentedLLM(provider);
    expect(llm).toBeDefined();
    expect(llm.getProviderName()).toBe('openai');
  });
});