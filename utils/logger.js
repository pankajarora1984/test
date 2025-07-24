const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

// Get current log level from environment
const currentLogLevel = process.env.LOG_LEVEL || 'INFO';
const logThreshold = LOG_LEVELS[currentLogLevel] || LOG_LEVELS.INFO;

// Helper function to format timestamp
function getTimestamp() {
    return new Date().toISOString();
}

// Helper function to format log message
function formatMessage(level, message, meta = {}) {
    const timestamp = getTimestamp();
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] [${level}] ${message} ${metaStr}`.trim();
}

// Write to log file
function writeToFile(level, message, meta = {}) {
    const logFileName = `app-${new Date().toISOString().split('T')[0]}.log`;
    const logFilePath = path.join(logsDir, logFileName);
    const formattedMessage = formatMessage(level, message, meta);
    
    fs.appendFileSync(logFilePath, formattedMessage + '\n');
}

// Write to console with colors
function writeToConsole(level, message, meta = {}) {
    const colors = {
        ERROR: '\x1b[31m', // Red
        WARN: '\x1b[33m',  // Yellow
        INFO: '\x1b[36m',  // Cyan
        DEBUG: '\x1b[37m'  // White
    };
    
    const reset = '\x1b[0m';
    const color = colors[level] || colors.INFO;
    const formattedMessage = formatMessage(level, message, meta);
    
    console.log(color + formattedMessage + reset);
}

// Main logging function
function log(level, message, meta = {}) {
    if (LOG_LEVELS[level] <= logThreshold) {
        writeToConsole(level, message, meta);
        writeToFile(level, message, meta);
    }
}

// Logger object with different methods
const logger = {
    error: (message, meta = {}) => log('ERROR', message, meta),
    warn: (message, meta = {}) => log('WARN', message, meta),
    info: (message, meta = {}) => log('INFO', message, meta),
    debug: (message, meta = {}) => log('DEBUG', message, meta),
    
    // HTTP request logging
    request: (req, res, duration) => {
        const logData = {
            method: req.method,
            url: req.url,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            status: res.statusCode,
            duration: `${duration}ms`,
            timestamp: getTimestamp()
        };
        
        const level = res.statusCode >= 400 ? 'ERROR' : 'INFO';
        log(level, `HTTP ${req.method} ${req.url}`, logData);
    },
    
    // API logging with more details
    api: (endpoint, method, status, duration, body = {}, error = null) => {
        const logData = {
            endpoint,
            method,
            status,
            duration: `${duration}ms`,
            bodySize: JSON.stringify(body).length,
            timestamp: getTimestamp()
        };
        
        if (error) {
            logData.error = error.message;
            logData.stack = error.stack;
        }
        
        const level = status >= 400 ? 'ERROR' : 'INFO';
        log(level, `API ${method} ${endpoint}`, logData);
    },
    
    // Database operation logging
    db: (operation, table, duration, error = null) => {
        const logData = {
            operation,
            table,
            duration: `${duration}ms`,
            timestamp: getTimestamp()
        };
        
        if (error) {
            logData.error = error.message;
        }
        
        const level = error ? 'ERROR' : 'DEBUG';
        log(level, `DB ${operation} on ${table}`, logData);
    },
    
    // Payment logging
    payment: (orderId, paymentId, amount, status, gateway, error = null) => {
        const logData = {
            orderId,
            paymentId,
            amount,
            status,
            gateway,
            timestamp: getTimestamp()
        };
        
        if (error) {
            logData.error = error.message;
        }
        
        const level = error || status === 'failed' ? 'ERROR' : 'INFO';
        log(level, `Payment ${status} for order ${orderId}`, logData);
    },
    
    // Performance logging
    performance: (operation, duration, details = {}) => {
        const logData = {
            operation,
            duration: `${duration}ms`,
            ...details,
            timestamp: getTimestamp()
        };
        
        const level = duration > 1000 ? 'WARN' : 'DEBUG';
        log(level, `Performance: ${operation}`, logData);
    }
};

// Export logger and utilities
module.exports = {
    logger,
    LOG_LEVELS,
    getLogFilePath: () => logsDir,
    createRequestLogger: () => {
        return (req, res, next) => {
            const start = Date.now();
            
            res.on('finish', () => {
                const duration = Date.now() - start;
                logger.request(req, res, duration);
            });
            
            next();
        };
    }
};