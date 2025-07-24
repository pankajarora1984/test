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
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/contact', contactRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);

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