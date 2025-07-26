// Simple Frontend Logger
// This must load before any other scripts that use logging

(function() {
    'use strict';
    
    // Ensure logger is available globally
    if (typeof window.logger === 'undefined') {
        window.logger = {
            api: function(message, method, status, duration, data, error) {
                try {
                    const logData = {
                        method: method || 'GET',
                        status: status || 200,
                        duration: duration || 0,
                        data: data || {},
                        error: error || null,
                        timestamp: new Date().toISOString()
                    };
                    console.log(`[API] ${message}`, logData);
                } catch (e) {
                    console.log(`[API] ${message}`);
                }
            },
            
            info: function(message, data) {
                try {
                    console.log(`[INFO] ${message}`, data || {});
                } catch (e) {
                    console.log(`[INFO] ${message}`);
                }
            },
            
            error: function(message, data) {
                try {
                    console.error(`[ERROR] ${message}`, data || {});
                } catch (e) {
                    console.error(`[ERROR] ${message}`);
                }
            },
            
            warn: function(message, data) {
                try {
                    console.warn(`[WARN] ${message}`, data || {});
                } catch (e) {
                    console.warn(`[WARN] ${message}`);
                }
            },
            
            debug: function(message, data) {
                try {
                    console.debug(`[DEBUG] ${message}`, data || {});
                } catch (e) {
                    console.debug(`[DEBUG] ${message}`);
                }
            }
        };
        
        console.log('✅ Frontend Logger initialized');
    } else {
        console.log('✅ Logger already exists');
    }
    
    // Test logger
    try {
        window.logger.info('Logger test successful');
    } catch (e) {
        console.error('Logger test failed:', e);
    }
})();