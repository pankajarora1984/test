const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const contactRouter = require('./routes/contact');

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/contact', contactRouter);

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Chandan Sarees API',
        version: '1.0.0',
        endpoints: {
            products: {
                'GET /api/products': 'Get all products',
                'GET /api/products/:id': 'Get product by ID',
                'GET /api/products/category/:category': 'Get products by category',
                'POST /api/products': 'Create new product (admin)',
                'PUT /api/products/:id': 'Update product (admin)',
                'DELETE /api/products/:id': 'Delete product (admin)'
            },
            categories: {
                'GET /api/categories': 'Get all categories',
                'GET /api/categories/:id': 'Get category by ID'
            },
            contact: {
                'POST /api/contact': 'Submit contact form'
            }
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        path: req.originalUrl
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Chandan Sarees API Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
    console.log(`🌐 Website: http://localhost:${PORT}`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;