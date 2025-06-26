import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BaseTool, ToolResult } from './base.js';

export class ReadFileTool extends BaseTool {
  name = 'read_file';
  description = 'Read contents of a file';
  parameters = z.object({
    filepath: z.string().describe('Path to the file'),
  });

  async execute(params: any): Promise<ToolResult> {
    const { filepath } = this.validateParams(params);
    
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      return {
        success: true,
        data: { content, filepath },
        metadata: { size: content.length }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${this.getErrorMessage(error)}`,
        metadata: { filepath }
      };
    }
  }
}

export class WriteFileTool extends BaseTool {
  name = 'write_file';
  description = 'Write content to a file';
  parameters = z.object({
    filepath: z.string(),
    content: z.string(),
    create_dirs: z.boolean().default(true),
  });

  async execute(params: any): Promise<ToolResult> {
    const { filepath, content, create_dirs } = this.validateParams(params);
    
    try {
      if (create_dirs) {
        await fs.mkdir(path.dirname(filepath), { recursive: true });
      }
      
      await fs.writeFile(filepath, content, 'utf-8');
      return {
        success: true,
        data: { filepath, bytes_written: content.length },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to write file: ${this.getErrorMessage(error)}`,
        metadata: { filepath }
      };
    }
  }
}

export class ListDirectoryTool extends BaseTool {
  name = 'list_directory';
  description = 'List contents of a directory';
  parameters = z.object({
    dirpath: z.string(),
    recursive: z.boolean().default(false),
  });

  async execute(params: any): Promise<ToolResult> {
    const { dirpath, recursive } = this.validateParams(params);
    
    try {
      const items: Array<{name: string, path: string, type: string}> = [];
      
      if (recursive) {
        const walkDir = async (dir: string): Promise<void> => {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            items.push({
              name: entry.name,
              path: fullPath,
              type: entry.isDirectory() ? 'directory' : 'file',
            });
            
            if (entry.isDirectory()) {
              await walkDir(fullPath);
            }
          }
        };
        await walkDir(dirpath);
      } else {
        const entries = await fs.readdir(dirpath, { withFileTypes: true });
        for (const entry of entries) {
          items.push({
            name: entry.name,
            path: path.join(dirpath, entry.name),
            type: entry.isDirectory() ? 'directory' : 'file',
          });
        }
      }
      
      return {
        success: true,
        data: { items, count: items.length },
        metadata: { dirpath, recursive }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to list directory: ${this.getErrorMessage(error)}`,
        metadata: { dirpath }
      };
    }
  }
}