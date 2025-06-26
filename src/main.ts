import { Agent } from './core/agent.js';
import { AugmentedLLM } from './core/augmented-llm.js';
import { OpenAIProvider } from './providers/openai.js';
import { ToolRegistry } from './tools/index.js';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function main() {
  console.log(chalk.cyan('🚀 MCP Agent TypeScript'));
  console.log(chalk.gray('━'.repeat(40)));
  
  try {
    // Initialize tool registry
    const toolRegistry = new ToolRegistry();
    console.log(chalk.green(`✅ Loaded ${toolRegistry.list().length} tools`));
    
    // List available tools
    console.log(chalk.blue('\n🛠️  Available Tools:'));
    toolRegistry.list().forEach(tool => {
      console.log(chalk.gray(`  • ${tool.name}: ${tool.description}`));
    });
    
    // Initialize provider if API key is available
    if (process.env.OPENAI_API_KEY) {
      const provider = new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4',           // ✅ Fixed
        temperature: 0.7,
        maxTokens: 4000,
      });
      
      const llm = new AugmentedLLM(provider);
      
      const agent = new Agent({
        name: 'MainAgent',
        instructions: 'You are a helpful AI assistant with access to various tools.',
        llm,
        maxIterations: 10,
      });
      
      console.log(chalk.green('\n✅ Agent initialized and ready!'));
      console.log(chalk.yellow('\n💡 To use the agent, import it in your code:'));
      console.log(chalk.gray('  import { Agent } from "./core/agent.js";'));
      
    } else {
      console.log(chalk.yellow('\n⚠️  No OPENAI_API_KEY found in environment'));
      console.log(chalk.gray('   Add your API key to .env file to enable full functionality'));
    }
    
    console.log(chalk.blue('\n📖 Run examples:'));
    console.log(chalk.gray('  npm run example:basic'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error initializing MCP Agent:'), error);
    process.exit(1);
  }
}

// Keep process alive for testing
process.stdin.resume();

main().catch(console.error);