#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ASCII Art Banner
console.log('\n' + '='.repeat(60));
console.log('🛍️  CHANDAN SAREES E-COMMERCE PLATFORM 🛍️');
console.log('='.repeat(60));

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('📁 Created logs directory:', logsDir);
}

// Show log file information
const today = new Date().toISOString().split('T')[0];
const logFileName = `app-${today}.log`;
const logFilePath = path.join(logsDir, logFileName);

console.log('\n📄 LOGGING INFORMATION:');
console.log('─'.repeat(40));
console.log(`📂 Log Directory: ${logsDir}`);
console.log(`📝 Log File: ${logFileName}`);
console.log(`📍 Full Path: ${logFilePath}`);
console.log(`🔍 Log Level: ${process.env.LOG_LEVEL || 'INFO'}`);

// Check if log file exists
if (fs.existsSync(logFilePath)) {
    const stats = fs.statSync(logFilePath);
    console.log(`📊 Current Log Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`🕐 Last Modified: ${stats.mtime.toISOString()}`);
} else {
    console.log('📋 Log file will be created on first log entry');
}

// Show how to monitor logs
console.log('\n🔧 LOG MONITORING COMMANDS:');
console.log('─'.repeat(40));
console.log(`📖 View latest logs: tail -f ${logFilePath}`);
console.log(`🔍 Search logs: grep "ERROR" ${logFilePath}`);
console.log(`📊 Count errors: grep -c "ERROR" ${logFilePath}`);
console.log(`🕐 Follow logs with timestamp: tail -f ${logFilePath} | grep -E "\\[.*\\]"`);

// Show API testing commands
console.log('\n🧪 API TESTING COMMANDS:');
console.log('─'.repeat(40));
console.log('🏥 Health Check: curl http://localhost:3000/health');
console.log('📚 API Docs: curl http://localhost:3000/api');
console.log('🛒 Test Cart: curl http://localhost:3000/api/cart/test_user');
console.log('📦 Test Products: curl http://localhost:3000/api/products');

console.log('\n' + '='.repeat(60));
console.log('🚀 STARTING SERVER...');
console.log('='.repeat(60) + '\n');

// Start the main server
const serverProcess = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        LOG_LEVEL: process.env.LOG_LEVEL || 'DEBUG',
        LOG_TO_FILE: 'true',
        LOG_TO_CONSOLE: 'true',
        LOG_REQUESTS: 'true'
    }
});

// Handle server process events
serverProcess.on('error', (err) => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
    if (code !== 0) {
        console.error(`❌ Server exited with code ${code}`);
    }
    if (signal) {
        console.log(`🛑 Server terminated by signal ${signal}`);
    }
    process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Terminating...');
    serverProcess.kill('SIGTERM');
});