#!/usr/bin/env node
// This script builds the action and runs it locally for testing purposes.
// It assumes that the action is built to the 'dist' directory and that the entry point
const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');
require('dotenv').config({ path: '.env.local' });

// Cross-platform npm command
const npmCmd = os.platform() === 'win32' ? 'npm.cmd' : 'npm';

// Build the action first
console.log('🔨 Building the action...');
const buildProcess = spawn(npmCmd, ['run', 'build'], {
  stdio: 'inherit',
  shell: true, // This helps with Windows compatibility
});

buildProcess.on('error', (err) => {
  console.error('❌ Failed to start build process:', err.message);
  console.log('💡 Make sure npm is installed and available in your PATH');
  process.exit(1);
});

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Build failed');
    process.exit(1);
  }

  console.log('✅ Build successful');
  console.log('🚀 Running action locally...\n');

  // Run the built action
  const distPath = path.resolve(__dirname, '../dist/index.js');
  console.log('🔍 Running action from:', distPath);

  const actionProcess = spawn('node', [`"${distPath}"`], {
    stdio: 'inherit',
    env: { ...process.env },
    shell: true, // This helps with Windows compatibility
    cwd: path.resolve(__dirname, '..'), // Set working directory to project root
  });

  actionProcess.on('error', (err) => {
    console.error('❌ Failed to start action:', err.message);
    process.exit(1);
  });

  actionProcess.on('close', (actionCode) => {
    if (actionCode === 0) {
      console.log('\n✅ Action completed successfully!');
      console.log('📄 Check ./scripts/README-DevTest.md to see the results');
    } else {
      console.error('\n❌ Action failed');
    }
  });
});
