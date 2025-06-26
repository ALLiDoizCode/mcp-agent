# mcp-agent-ts

![npm version](https://badge.fury.io/js/mcp-agent-typescript.svg)
[![npm downloads](https://img.shields.io/npm/dm/mcp-agent-typescript.svg)](https://www.npmjs.com/package/mcp-agent-typescript)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

TypeScript implementation of Anthropic's MCP (Model Context Protocol) agent patterns with OpenAI integration.

## Features

🤖 **Agent Orchestration** - Memory-enhanced agents with tool execution  
🛠️ **8 Core Tools** - Filesystem, web, execution, and HTTP capabilities  
🔌 **Multi-Provider** - OpenAI and Anthropic integration  
🧠 **Memory Management** - Persistent conversation context  
⚡ **Function Calling** - Real OpenAI function calling support  
📝 **Type Safe** - Full TypeScript with comprehensive types  
🧪 **Well Tested** - Complete Jest test suite  

## Installation

```bash
npm install mcp-agent-typescript
```

## Quick Start

```typescript
import { Agent, AugmentedLLM, OpenAIProvider } from 'mcp-agent-ts';

// Create provider
const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4',
});

// Create enhanced LLM with memory
const llm = new AugmentedLLM(provider);

// Create agent with tools
const agent = new Agent({
  name: 'MyAgent',
  instructions: 'You are a helpful assistant that can use tools.',
  llm,
  tools: ['read_file', 'write_file', 'web_search'],
  maxIterations: 5,
});

// Run the agent
const response = await agent.run('Create a hello world JavaScript file');
console.log(response);
```

## Core Classes

### Agent
```typescript
const agent = new Agent({
  name: string,
  instructions: string,
  llm: AugmentedLLM,
  tools?: string[],
  maxIterations?: number
});
```

### AugmentedLLM
```typescript
const llm = new AugmentedLLM(provider);
await llm.generateResponse(prompt, tools);
await llm.addMemory(memory);
```

### Providers
```typescript
// OpenAI
const openai = new OpenAIProvider({
  apiKey: string,
  model?: string,
  temperature?: number,
  maxTokens?: number
});

// Anthropic
const anthropic = new AnthropicProvider({
  apiKey: string,
  model?: string,
  temperature?: number,
  maxTokens?: number
});
```

## Available Tools

- **read_file** - Read file contents
- **write_file** - Write content to files  
- **list_directory** - List directory contents
- **web_search** - Search the web (mock implementation)
- **web_fetch** - Fetch web page content
- **shell_command** - Execute shell commands
- **node_script** - Run Node.js code
- **http_request** - Make HTTP requests

## Custom Tools

```typescript
import { BaseTool, ToolResult } from 'mcp-agent-ts';
import { z } from 'zod';

class MyCustomTool extends BaseTool {
  name = 'my_tool';
  description = 'Does something custom';
  parameters = z.object({
    input: z.string()
  });

  async execute(params: any): Promise<ToolResult> {
    // Your tool logic here
    return { success: true, data: { result: 'done' } };
  }
}

// Register with agent
const toolRegistry = new ToolRegistry();
toolRegistry.register(new MyCustomTool());
```

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key  # optional
```

## Examples

See the [examples](./src/examples/) directory for complete working examples.

## TypeScript Support

This package is built with TypeScript and includes full type definitions. No additional `@types` packages needed!

## Contributing

Contributions welcome! Please read our [Contributing Guide](./CONTRIBUTING.md).

## License

MIT License - see [LICENSE](./LICENSE) file.

## Related

- [Anthropic's Agent Patterns](https://docs.anthropic.com/en/docs/build-with-claude/agent-patterns)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Model Context Protocol](https://modelcontextprotocol.io/)

```bash
# Build and test
npm run build
npm test
```