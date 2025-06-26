import chalk from 'chalk';

export interface MCPAppConfig {
  name: string;
  version?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export class MCPApp {
  public name: string;
  public version: string;
  private logLevel: string;
  private isRunning: boolean = false;

  constructor(config: MCPAppConfig) {
    this.name = config.name;
    this.version = config.version || '1.0.0';
    this.logLevel = config.logLevel || 'info';
    
    console.log(chalk.cyan.bold(`🚀 MCP App: ${this.name} v${this.version}`));
    console.log(chalk.blue(`📊 Log level: ${this.logLevel}`));
  }

  // Context manager pattern - matches Python mcp-agent API
  async run(): Promise<MCPAppContext> {
    if (this.isRunning) {
      throw new Error(`MCP App ${this.name} is already running`);
    }

    this.isRunning = true;
    console.log(chalk.green(`✅ MCP App ${this.name} started`));
    
    return new MCPAppContext(this);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log(chalk.yellow(`🛑 MCP App ${this.name} stopped`));
  }

  getStatus(): {
    name: string;
    version: string;
    isRunning: boolean;
    logLevel: string;
  } {
    return {
      name: this.name,
      version: this.version,
      isRunning: this.isRunning,
      logLevel: this.logLevel
    };
  }
}

// Context manager for proper resource management
export class MCPAppContext {
  private app: MCPApp;
  private cleanupFunctions: (() => Promise<void>)[] = [];

  constructor(app: MCPApp) {
    this.app = app;
  }

  // Add cleanup function
  addCleanup(fn: () => Promise<void>): void {
    this.cleanupFunctions.push(fn);
  }

  // Get app reference
  getApp(): MCPApp {
    return this.app;
  }

  // Logger for the context
  get logger() {
    return {
      info: (message: string, data?: any) => {
        console.log(chalk.blue(`INFO ${this.app.name}: ${message}`), data || '');
      },
      warn: (message: string, data?: any) => {
        console.log(chalk.yellow(`WARN ${this.app.name}: ${message}`), data || '');
      },
      error: (message: string, data?: any) => {
        console.log(chalk.red(`ERROR ${this.app.name}: ${message}`), data || '');
      },
      debug: (message: string, data?: any) => {
        console.log(chalk.gray(`DEBUG ${this.app.name}: ${message}`), data || '');
      }
    };
  }

  // Cleanup resources when context ends
  async cleanup(): Promise<void> {
    console.log(chalk.yellow(`🧹 Cleaning up MCP App: ${this.app.name}`));
    
    for (const cleanup of this.cleanupFunctions) {
      try {
        await cleanup();
      } catch (error) {
        console.error(chalk.red(`Cleanup error: ${error}`));
      }
    }
    
    await this.app.stop();
    console.log(chalk.green(`✅ MCP App ${this.app.name} cleanup complete`));
  }
}
