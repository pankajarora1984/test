const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import enhanced logging
const { logger, createRequestLogger } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Log application startup
logger.info('🚀 Starting Chandan Sarees E-commerce Server', {
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'INFO'
});

// Middleware - Security with relaxed CSP for static assets
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));
logger.debug('✅ Helmet security middleware enabled with relaxed CSP');

app.use(cors());
logger.debug('✅ CORS middleware enabled');

// Enhanced request logging
if (process.env.LOG_REQUESTS === 'true') {
    app.use(createRequestLogger());
    logger.debug('✅ Enhanced request logging enabled');
} else {
    app.use(morgan('combined'));
    logger.debug('✅ Basic Morgan logging enabled');
}

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
logger.debug('✅ Body parser middleware enabled');

// Serve static files (frontend) with proper MIME types
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));
logger.debug('✅ Static file serving enabled for /public with explicit MIME types');

// Import routes
logger.debug('📁 Loading route modules...');
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const contactRouter = require('./routes/contact');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
logger.debug('✅ All route modules loaded successfully');

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/contact', contactRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
logger.info('🛣️  API routes registered successfully', {
    routes: ['/api/products', '/api/categories', '/api/contact', '/api/cart', '/api/orders']
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Chandan Sarees E-commerce API',
        version: '2.0.0',
        features: ['Products', 'Categories', 'Shopping Cart', 'Orders', 'Payment Integration', 'Contact'],
        endpoints: {
            products: {
                'GET /api/products': 'Get all products (with filtering, sorting, pagination)',
                'GET /api/products/:id': 'Get product by ID',
                'GET /api/products/category/:category': 'Get products by category',
                'POST /api/products': 'Create new product (admin)',
                'PUT /api/products/:id': 'Update product (admin)',
                'DELETE /api/products/:id': 'Delete product (admin)'
            },
            categories: {
                'GET /api/categories': 'Get all categories',
                'GET /api/categories/:id': 'Get category by ID',
                'POST /api/categories': 'Create category (admin)',
                'PUT /api/categories/:id': 'Update category (admin)',
                'DELETE /api/categories/:id': 'Delete category (admin)'
            },
            cart: {
                'GET /api/cart/:userId': 'Get user cart',
                'POST /api/cart/:userId/add': 'Add item to cart',
                'PUT /api/cart/:userId/update/:itemId': 'Update cart item quantity',
                'DELETE /api/cart/:userId/remove/:itemId': 'Remove item from cart',
                'DELETE /api/cart/:userId/clear': 'Clear entire cart',
                'POST /api/cart/:userId/apply-coupon': 'Apply discount coupon',
                'GET /api/cart/count/:userId': 'Get cart items count'
            },
            orders: {
                'POST /api/orders/create': 'Create order from cart',
                'POST /api/orders/verify-payment': 'Verify Razorpay payment',
                'GET /api/orders/:userId': 'Get user orders',
                'GET /api/orders/detail/:orderId': 'Get order details',
                'PUT /api/orders/:orderId/cancel': 'Cancel order',
                'PUT /api/orders/:orderId/status': 'Update order status (admin)',
                'GET /api/orders/track/:orderNumber': 'Track order by number',
                'GET /api/orders/admin/all': 'Get all orders (admin)'
            },
            contact: {
                'POST /api/contact': 'Submit contact form',
                'GET /api/contact/info': 'Get business contact information',
                'POST /api/contact/newsletter': 'Newsletter subscription'
            }
        },
        paymentGateway: 'Razorpay',
        supportedCurrency: 'INR'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    const healthData = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    };
    
    logger.debug('🏥 Health check requested', healthData);
    res.json(healthData);
});

// Debug endpoint to help diagnose issues
app.get('/debug', (req, res) => {
    const debugInfo = {
        timestamp: new Date().toISOString(),
        request: {
            ip: req.ip,
            ips: req.ips,
            method: req.method,
            url: req.url,
            headers: req.headers,
            userAgent: req.get('User-Agent')
        },
        server: {
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            cwd: process.cwd(),
            staticPath: path.join(__dirname, 'public')
        },
        files: {
            stylesExists: fs.existsSync(path.join(__dirname, 'public', 'styles.css')),
            scriptExists: fs.existsSync(path.join(__dirname, 'public', 'script.js')),
            indexExists: fs.existsSync(path.join(__dirname, 'public', 'index.html'))
        }
    };
    
    logger.info('🔍 Debug info requested', debugInfo);
    res.json(debugInfo);
});

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('💥 Unhandled server error', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
    });
    
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    logger.warn('🔍 API endpoint not found', {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip || req.connection.remoteAddress
    });
    
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        message: `The requested API endpoint ${req.originalUrl} does not exist`
    });
});

// Start server with enhanced logging - bind to all interfaces for AWS EC2
const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info('🎉 Chandan Sarees E-commerce Server Started Successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        logLevel: process.env.LOG_LEVEL || 'INFO',
        urls: {
            api: `http://localhost:${PORT}/api`,
            website: `http://localhost:${PORT}`,
            health: `http://localhost:${PORT}/health`
        }
    });
    
    console.log(`🚀 Chandan Sarees API Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
    console.log(`🌐 Website: http://localhost:${PORT}`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
    console.log(`📄 Log files location: ./logs/`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    logger.info('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('✅ Server closed successfully');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('✅ Server closed successfully');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('💥 Uncaught Exception', {
        error: err.message,
        stack: err.stack
    });
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 Unhandled Promise Rejection', {
        reason: reason,
        promise: promise
    });
});

module.exports = app;