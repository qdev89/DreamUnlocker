#!/usr/bin/env node

/**
 * Quick Firebase Test Runner for Dream Unlocker
 * 
 * This script provides an easy way to run the Firebase test suite from the root directory.
 * 
 * Usage:
 *   node test-firebase.mjs           # Run all tests
 *   node test-firebase.mjs auth      # Run auth tests only
 *   node test-firebase.mjs --ui      # Run with UI
 *   node test-firebase.mjs --watch   # Run in watch mode
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testsDir = join(__dirname, 'tests');

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

console.log(`${BOLD}${BLUE}🚀 Dream Unlocker - Firebase Test Suite${RESET}`);
console.log(`${CYAN}Running from: ${testsDir}${RESET}\n`);

// Pass all arguments to the test runner
const args = process.argv.slice(2);

const testProcess = spawn('node', ['run-tests.mjs', ...args], {
  cwd: testsDir,
  stdio: 'inherit',
  shell: true
});

testProcess.on('close', (code) => {
  process.exit(code);
});

testProcess.on('error', (error) => {
  console.error(`Failed to run tests: ${error.message}`);
  process.exit(1);
});