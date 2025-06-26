import { Tool } from './base.js';
import { ReadFileTool, WriteFileTool, ListDirectoryTool } from './filesystem.js';
import { WebSearchTool, WebFetchTool } from './web.js';
import { ShellCommandTool, NodeScriptTool } from './execution.js';
import { HttpRequestTool } from './http.js';

// Re-export base classes and interfaces
export { BaseTool, type Tool, type ToolResult } from './base.js';

// Re-export filesystem tools
export { ReadFileTool, WriteFileTool, ListDirectoryTool } from './filesystem.js';

// Re-export web tools
export { WebSearchTool, WebFetchTool } from './web.js';

// Re-export execution tools
export { ShellCommandTool, NodeScriptTool } from './execution.js';

// Re-export HTTP tools
export { HttpRequestTool } from './http.js';

// Tool registry
export class ToolRegistry {
  private tools = new Map<string, Tool>();
  
  constructor() {
    this.registerDefaultTools();
  }
  
  private registerDefaultTools() {
    const defaultTools: Tool[] = [
      // Filesystem
      new ReadFileTool(),
      new WriteFileTool(),
      new ListDirectoryTool(),
      
      // Web
      new WebSearchTool(),
      new WebFetchTool(),
      
      // Execution  
      new ShellCommandTool(),
      new NodeScriptTool(),
      
      // HTTP
      new HttpRequestTool(),
    ];
    
    defaultTools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });
  }
  
  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }
  
  unregister(name: string): boolean {
    return this.tools.delete(name);
  }
  
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }
  
  list(): Tool[] {
    return Array.from(this.tools.values());
  }
  
  getToolSchemas() {
    return this.list().map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters._def,
    }));
  }
  
  async executeTool(name: string, params: any) {
    const tool = this.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }
    
    return await tool.execute(params);
  }
  
  getAvailableToolNames(): string[] {
    return Array.from(this.tools.keys());
  }
  
  hasToolFunction(name: string): boolean {
    return this.tools.has(name);
  }
}