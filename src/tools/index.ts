import { Tool } from './base.js';
import { ReadFileTool, WriteFileTool, ListDirectoryTool } from './filesystem.js';
import { WebSearchTool, WebFetchTool } from './web.js';
import { ShellCommandTool, NodeScriptTool } from './execution.js';
import { HttpRequestTool } from './http.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Re-export base classes and interfaces
export { BaseTool, type Tool, type ToolResult } from './base.js';

// Re-export all tool classes
export { ReadFileTool, WriteFileTool, ListDirectoryTool } from './filesystem.js';
export { WebSearchTool, WebFetchTool } from './web.js';
export { ShellCommandTool, NodeScriptTool } from './execution.js';
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
      parameters: this.zodToJsonSchema(tool.parameters),
    }));
  }
  
  private zodToJsonSchema(zodSchema: any): any {
    // Convert Zod schema to JSON Schema format
    try {
      // Use zod-to-json-schema if available, otherwise manual conversion
      if (typeof zodToJsonSchema === 'function') {
        return zodToJsonSchema(zodSchema);
      }
    } catch (error) {
      // Fallback to manual conversion
    }
    
    // Manual conversion for basic Zod objects
    if (zodSchema._def?.typeName === 'ZodObject') {
      const properties: any = {};
      const required: string[] = [];
      
      for (const [key, value] of Object.entries(zodSchema._def.shape())) {
        const field: any = value;
        properties[key] = this.convertZodFieldToJsonSchema(field);
        
        if (!field._def?.isOptional) {
          required.push(key);
        }
      }
      
      return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
      };
    }
    
    return { type: 'object', properties: {} };
  }
  
  private convertZodFieldToJsonSchema(field: any): any {
    const typeName = field._def?.typeName;
    
    switch (typeName) {
      case 'ZodString':
        return {
          type: 'string',
          description: field._def?.description,
        };
      case 'ZodNumber':
        return {
          type: 'number',
          description: field._def?.description,
        };
      case 'ZodBoolean':
        return {
          type: 'boolean',
          description: field._def?.description,
        };
      case 'ZodDefault':
        const innerSchema = this.convertZodFieldToJsonSchema(field._def.innerType);
        return {
          ...innerSchema,
          default: field._def.defaultValue(),
        };
      case 'ZodEnum':
        return {
          type: 'string',
          enum: field._def.values,
          description: field._def?.description,
        };
      default:
        return {
          type: 'string',
          description: field._def?.description || 'Unknown type',
        };
    }
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