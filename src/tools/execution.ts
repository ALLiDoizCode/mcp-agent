import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { BaseTool, ToolResult } from './base.js';

const execAsync = promisify(exec);

interface ExecError extends Error {
  code?: number;
  stdout?: string;
  stderr?: string;
}

export class ShellCommandTool extends BaseTool {
  name = 'shell_command';
  description = 'Execute shell commands';
  parameters = z.object({
    command: z.string(),
    cwd: z.string().optional(),
    timeout: z.number().default(30000),
  });

  async execute(params: any): Promise<ToolResult> {
    const { command, cwd, timeout } = this.validateParams(params);
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: cwd || process.cwd(),
        timeout,
      });
      
      return {
        success: true,
        data: { 
          stdout: stdout.trim(), 
          stderr: stderr.trim(),
          command,
          exit_code: 0
        },
        metadata: { cwd: cwd || process.cwd() }
      };
    } catch (error) {
      const execError = error as ExecError;
      return {
        success: false,
        error: `Command failed: ${this.getErrorMessage(error)}`,
        data: {
          stdout: execError.stdout?.trim() || '',
          stderr: execError.stderr?.trim() || '',
          command,
          exit_code: execError.code || 1
        },
        metadata: { cwd: cwd || process.cwd() }
      };
    }
  }
}

export class NodeScriptTool extends BaseTool {
  name = 'node_script';
  description = 'Execute Node.js code';
  parameters = z.object({
    code: z.string(),
    timeout: z.number().default(30000),
  });

  async execute(params: any): Promise<ToolResult> {
    const { code, timeout } = this.validateParams(params);
    
    try {
      // Use eval in isolated context for simple execution
      // In production, consider using vm module for better isolation
      const result = eval(`(async () => { ${code} })()`);
      const output = await Promise.resolve(result);
      
      return {
        success: true,
        data: { output, code: code.substring(0, 100) + '...' },
      };
    } catch (error) {
      return {
        success: false,
        error: `Script execution failed: ${this.getErrorMessage(error)}`,
        data: { code: code.substring(0, 100) + '...' },
      };
    }
  }
}