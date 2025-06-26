import { Agent } from '../core/agent.js';
import { AugmentedLLM } from '../core/augmented-llm.js';
import { OpenAIProvider } from '../providers/openai.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function basicExample() {
  console.log('🤖 Creating mcp-agent...');
  
  // Initialize provider with correct config
  const provider = new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4000,
  });
  
  // Create augmented LLM
  const llm = new AugmentedLLM(provider);
  
  // Create agent with tools
  const agent = new Agent({
    name: 'FileAssistant',
    instructions: `You are a file management assistant. You can:
    - Read and write files
    - Search the web for information
    - Execute shell commands
    
    Always be helpful and explain what you're doing.`,
    llm,
    tools: ['read_file', 'write_file', 'list_directory', 'web_search'],
    maxIterations: 5,
  });
  
  console.log('✅ Agent created with tools:', agent.getEnabledTools());
  
  // Example 1: File operations
  console.log('\n📁 Example 1: File Operations');
  try {
    const response1 = await agent.run('Create a simple hello world file in JavaScript');
    console.log('Response:', response1);
  } catch (error) {
    console.error('Error:', error);
  }
  
  // Example 2: Web search + file creation
  console.log('\n🔍 Example 2: Web Search + File Creation');
  try {
    const response2 = await agent.run('Search for TypeScript best practices and create a summary file');
    console.log('Response:', response2);
  } catch (error) {
    console.error('Error:', error);
  }
  
  console.log('\n🎉 Examples completed!');
}

export { basicExample };