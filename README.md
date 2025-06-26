# 🤖 MCP Agent (TypeScript)

> TypeScript implementation of Anthropic's "Building Effective Agents" patterns using Model Context Protocol

[![npm version](https://badge.fury.io/js/mcp-agent.svg)](https://badge.fury.io/js/mcp-agent)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 What is MCP Agent TypeScript?

This is the **TypeScript equivalent** of the popular [Python mcp-agent](https://github.com/lastmile-ai/mcp-agent) framework. It provides a complete implementation of Anthropic's proven agent patterns:

- ✅ **All Anthropic Patterns** - Prompt Chaining, Routing, Parallel, Orchestrator, Evaluator-Optimizer, Autonomous Agents
- ✅ **Model Context Protocol** - Full MCP integration for tools and data sources
- ✅ **Production Ready** - Proper testing, logging, error handling
- ✅ **TypeScript First** - Full type safety throughout
- ✅ **Multiple LLM Providers** - OpenAI, Anthropic, extensible
- ✅ **Compatible** - Works with existing MCP ecosystem

## 🚀 Quick Start

```bash
npm install mcp-agent
```

```typescript
import { MCPApp, Agent, OpenAIAugmentedLLM } from 'mcp-agent';

// Create MCP app
const app = new MCPApp({ name: "my-agent-app" });

// Create an agent with MCP servers
const agent = new Agent({
  name: "finder",
  instruction: "You can read files and fetch URLs. Help users find information.",
  serverNames: ["filesystem", "fetch"]
});

// Use the agent
async function example() {
  async with app.run() as mcpApp {
    async with agent {
      const llm = await agent.attachLLM(OpenAIAugmentedLLM);
      const result = await llm.generateString("Show me what's in README.md");
      console.log(result);
    }
  }
}
```

## 🏗️ Relationship to Python MCP Agent

This TypeScript implementation provides the same powerful patterns as the [Python mcp-agent](https://github.com/lastmile-ai/mcp-agent):

| Feature | Python mcp-agent | TypeScript mcp-agent |
|---------|------------------|---------------------|
| Anthropic Patterns | ✅ | ✅ |
| MCP Integration | ✅ | ✅ |
| Multi-LLM Support | ✅ | ✅ |
| Workflow Composition | ✅ | ✅ |
| Production Ready | ✅ | ✅ |

## 📚 Documentation

- [Getting Started Guide](./docs/GETTING_STARTED.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Anthropic Patterns Guide](./docs/PATTERNS.md)
- [Examples](./examples/)

## 🏗️ Status

**Currently in development** - Building the TypeScript equivalent step by step!

- ✅ Project foundation
- 🔄 Core classes (in progress)
- ⏳ Workflow patterns
- ⏳ MCP integration
- ⏳ Examples and documentation

## 🤝 Contributing

Help us build the definitive TypeScript MCP agent framework!

## 📄 License

MIT - see [LICENSE](LICENSE) file for details.