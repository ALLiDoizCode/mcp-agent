import { basicExample } from './basic-usage.js';

// Simple runner that executes the basic example
async function main() {
  try {
    await basicExample();
    process.exit(0);
  } catch (error) {
    console.error('Example failed:', error);
    process.exit(1);
  }
}

main();