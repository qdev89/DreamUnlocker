#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';

console.log(`${BOLD}${BLUE}🔥 Dream Unlocker Firebase Test Suite${RESET}\n`);

// Check if node_modules exists
const nodeModulesPath = join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log(`${YELLOW}📦 Installing dependencies...${RESET}`);
  
  const installProcess = spawn('npm', ['install'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  installProcess.on('close', (code) => {
    if (code === 0) {
      console.log(`${GREEN}✅ Dependencies installed successfully!${RESET}\n`);
      runTests();
    } else {
      console.error(`${RED}❌ Failed to install dependencies${RESET}`);
      process.exit(1);
    }
  });
} else {
  runTests();
}

function runTests() {
  // Check if .env file exists
  const envPath = join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log(`${YELLOW}⚠️  .env file not found. Copying from .env.example...${RESET}`);
    fs.copyFileSync(join(__dirname, '.env.example'), envPath);
    console.log(`${GREEN}✅ .env file created. Please review and update if needed.${RESET}\n`);
  }

  console.log(`${BOLD}🧪 Running Firebase Tests...${RESET}\n`);
  
  const args = process.argv.slice(2);
  const testProcess = spawn('npm', ['test', ...args], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  testProcess.on('close', (code) => {
    if (code === 0) {
      console.log(`\n${GREEN}${BOLD}🎉 All tests passed!${RESET}`);
      console.log(`${BLUE}📊 Test coverage and results are available above.${RESET}`);
    } else {
      console.log(`\n${RED}${BOLD}❌ Some tests failed${RESET}`);
      console.log(`${YELLOW}💡 Check the output above for details.${RESET}`);
    }
    process.exit(code);
  });

  testProcess.on('error', (error) => {
    console.error(`${RED}❌ Failed to run tests: ${error.message}${RESET}`);
    process.exit(1);
  });
}