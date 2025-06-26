// Test setup file
import * as dotenv from 'dotenv';

// Load environment variables for tests
dotenv.config({ path: '.env.test' });

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test timeout
jest.setTimeout(30000);