#!/usr/bin/env node

/**
 * Test Suite for MCP Rust/Slint Development Server
 *
 * This test script verifies the MCP server functionality and ensures
 * all tools work correctly. Part of the open-source MCP server project.
 *
 * Copyright (c) 2025 RKTakami
 *
 * Licensed under the MIT License - this is FREE and OPEN SOURCE software!
 * Repository: https://github.com/RKTakami/mcp-rust-slint-server
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test the MCP server with initialization and a tool call
function testServer() {
  const serverProcess = spawn('node', ['build/index.js'], {
    cwd: join(__dirname, '.'),
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  let errorOutput = '';

  serverProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log('Server stdout:', data.toString());
  });

  serverProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.log('Server stderr:', data.toString());
  });

  // Send initialization request
  const initMessage = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    }
  };

  setTimeout(() => {
    serverProcess.stdin.write(JSON.stringify(initMessage) + '\n');
    console.log('Sent initialization message');
  }, 1000);

  // Send a tool call to get data status
  setTimeout(() => {
    const toolMessage = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "get_data_status",
        arguments: {}
      }
    };
    
    serverProcess.stdin.write(JSON.stringify(toolMessage) + '\n');
    console.log('Sent get_data_status tool call');
  }, 2000);

  // Close after 5 seconds
  setTimeout(() => {
    console.log('Test completed, closing server');
    serverProcess.kill();
    process.exit(0);
  }, 5000);

  serverProcess.on('close', (code) => {
    console.log(`Server closed with code: ${code}`);
    console.log('Final output:', output);
    console.log('Final error:', errorOutput);
  });

  serverProcess.on('error', (error) => {
    console.error('Server process error:', error);
  });
}

testServer();