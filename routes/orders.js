const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay (use test credentials for development)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_key'
});

// In-memory orders storage (in production, use database)
let orders = [];

// Order status enum
const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
};

// Payment status enum
const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

// Helper function to generate order number
const generateOrderNumber = () => {
    const prefix = 'CS';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
};

// POST /api/orders/create - Create order from cart
router.post('/create', async (req, res) => {
    try {
        const {
            userId,
            cartId,
            shippingAddress,
            billingAddress,
            paymentMethod = 'razorpay'
        } = req.body;

        // Validation
        if (!userId || !cartId || !shippingAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, cartId, shippingAddress'
            });
        }

        // Get cart data (in production, fetch from cart service)
        const carts = require('./cart'); // This needs to be imported properly
        // For now, create a mock cart
        const cart = {
            id: cartId,
            userId,
            items: [
                {
                    id: uuidv4(),
                    productId: '1',
                    name: 'Banarasi Silk Saree',
                    price: 15999,
                    quantity: 1,
                    selectedSize: 'Free Size',
                    selectedColor: 'Red'
                }
            ],
            subtotal: 15999,
            tax: 2880,
            shipping: 0,
            total: 18879
        };

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Cart is empty or not found'
            });
        }

        // Create order
        const order = {
            id: uuidv4(),
            orderNumber: generateOrderNumber(),
            userId,
            cartId,
            items: cart.items.map(item => ({
                ...item,
                orderedAt: new Date().toISOString()
            })),
            pricing: {
                subtotal: cart.subtotal,
                tax: cart.tax,
                shipping: cart.shipping,
                discount: cart.coupon?.discount || 0,
                total: cart.total
            },
            coupon: cart.coupon || null,
            addresses: {
                shipping: shippingAddress,
                billing: billingAddress || shippingAddress
            },
            paymentMethod,
            paymentStatus: PAYMENT_STATUS.PENDING,
            orderStatus: ORDER_STATUS.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };

        // Create Razorpay order if payment method is razorpay
        if (paymentMethod === 'razorpay') {
            try {
                const razorpayOrder = await razorpay.orders.create({
                    amount: order.pricing.total * 100, // Convert to paise
                    currency: 'INR',
                    receipt: order.orderNumber,
                    notes: {
                        orderId: order.id,
                        userId: order.userId
                    }
                });

                order.razorpayOrderId = razorpayOrder.id;
                order.razorpayOrder = razorpayOrder;
            } catch (razorpayError) {
                console.error('Razorpay order creation failed:', razorpayError);
                return res.status(500).json({
                    success: false,
                    error: 'Payment gateway error',
                    message: 'Failed to initialize payment'
                });
            }
        }

        // Save order
        orders.push(order);

        res.status(201).json({
            success: true,
            data: order,
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create order',
            message: error.message
        });
    }
});

// POST /api/orders/verify-payment - Verify Razorpay payment
router.post('/verify-payment', (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).json({
                success: false,
                error: 'Missing payment verification parameters'
            });
        }

        // Find order
        const order = orders.find(o => o.id === orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'test_secret_key')
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment successful - update order
            order.paymentStatus = PAYMENT_STATUS.COMPLETED;
            order.orderStatus = ORDER_STATUS.CONFIRMED;
            order.razorpayPaymentId = razorpay_payment_id;
            order.paymentCompletedAt = new Date().toISOString();
            order.updatedAt = new Date().toISOString();

            res.json({
                success: true,
                data: order,
                message: 'Payment verified successfully'
            });
        } else {
            // Payment verification failed
            order.paymentStatus = PAYMENT_STATUS.FAILED;
            order.updatedAt = new Date().toISOString();

            res.status(400).json({
                success: false,
                error: 'Payment verification failed',
                data: order
            });
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Payment verification failed',
            message: error.message
        });
    }
});

// GET /api/orders/:userId - Get user's orders
router.get('/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        let userOrders = orders.filter(order => order.userId === userId);

        // Filter by status if provided
        if (status) {
            userOrders = userOrders.filter(order => order.orderStatus === status);
        }

        // Sort by creation date (newest first)
        userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedOrders = userOrders.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: paginatedOrders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(userOrders.length / limit),
                totalOrders: userOrders.length,
                hasNext: endIndex < userOrders.length,
                hasPrev: startIndex > 0
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch orders',
            message: error.message
        });
    }
});

// GET /api/orders/detail/:orderId - Get order details
router.get('/detail/:orderId', (req, res) => {
    try {
        const { orderId } = req.params;
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch order details',
            message: error.message
        });
    }
});

// PUT /api/orders/:orderId/cancel - Cancel order
router.put('/:orderId/cancel', (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;

        const order = orders.find(o => o.id === orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check if order can be cancelled
        const cancellableStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED];
        if (!cancellableStatuses.includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                error: 'Order cannot be cancelled at this stage'
            });
        }

        order.orderStatus = ORDER_STATUS.CANCELLED;
        order.cancellationReason = reason || 'Cancelled by customer';
        order.cancelledAt = new Date().toISOString();
        order.updatedAt = new Date().toISOString();

        // If payment was completed, initiate refund process
        if (order.paymentStatus === PAYMENT_STATUS.COMPLETED) {
            order.refundStatus = 'initiated';
            order.refundInitiatedAt = new Date().toISOString();
        }

        res.json({
            success: true,
            data: order,
            message: 'Order cancelled successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to cancel order',
            message: error.message
        });
    }
});

// PUT /api/orders/:orderId/status - Update order status (admin)
router.put('/:orderId/status', (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, trackingNumber, notes } = req.body;

        if (!Object.values(ORDER_STATUS).includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid order status'
            });
        }

        const order = orders.find(o => o.id === orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        const oldStatus = order.orderStatus;
        order.orderStatus = status;
        order.updatedAt = new Date().toISOString();

        // Add status history
        if (!order.statusHistory) {
            order.statusHistory = [];
        }
        order.statusHistory.push({
            from: oldStatus,
            to: status,
            timestamp: new Date().toISOString(),
            notes
        });

        // Add tracking number if shipped
        if (status === ORDER_STATUS.SHIPPED && trackingNumber) {
            order.trackingNumber = trackingNumber;
            order.shippedAt = new Date().toISOString();
        }

        // Set delivered date if delivered
        if (status === ORDER_STATUS.DELIVERED) {
            order.deliveredAt = new Date().toISOString();
        }

        res.json({
            success: true,
            data: order,
            message: `Order status updated to ${status}`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update order status',
            message: error.message
        });
    }
});

// GET /api/orders/track/:orderNumber - Track order by order number
router.get('/track/:orderNumber', (req, res) => {
    try {
        const { orderNumber } = req.params;
        const order = orders.find(o => o.orderNumber === orderNumber);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Return tracking information
        const trackingInfo = {
            orderNumber: order.orderNumber,
            status: order.orderStatus,
            trackingNumber: order.trackingNumber,
            estimatedDelivery: order.estimatedDelivery,
            statusHistory: order.statusHistory || [],
            currentLocation: order.currentLocation || 'Processing Center',
            lastUpdated: order.updatedAt
        };

        res.json({
            success: true,
            data: trackingInfo
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to track order',
            message: error.message
        });
    }
});

// GET /api/orders/admin/all - Get all orders (admin)
router.get('/admin/all', (req, res) => {
    try {
        const { status, page = 1, limit = 20, sortBy = 'newest' } = req.query;

        let allOrders = [...orders];

        // Filter by status
        if (status) {
            allOrders = allOrders.filter(order => order.orderStatus === status);
        }

        // Sort orders
        switch (sortBy) {
            case 'oldest':
                allOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'amount_high':
                allOrders.sort((a, b) => b.pricing.total - a.pricing.total);
                break;
            case 'amount_low':
                allOrders.sort((a, b) => a.pricing.total - b.pricing.total);
                break;
            default: // newest
                allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedOrders = allOrders.slice(startIndex, endIndex);

        // Calculate statistics
        const stats = {
            total: orders.length,
            pending: orders.filter(o => o.orderStatus === ORDER_STATUS.PENDING).length,
            confirmed: orders.filter(o => o.orderStatus === ORDER_STATUS.CONFIRMED).length,
            shipped: orders.filter(o => o.orderStatus === ORDER_STATUS.SHIPPED).length,
            delivered: orders.filter(o => o.orderStatus === ORDER_STATUS.DELIVERED).length,
            cancelled: orders.filter(o => o.orderStatus === ORDER_STATUS.CANCELLED).length,
            totalRevenue: orders
                .filter(o => o.paymentStatus === PAYMENT_STATUS.COMPLETED)
                .reduce((sum, o) => sum + o.pricing.total, 0)
        };

        res.json({
            success: true,
            data: paginatedOrders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(allOrders.length / limit),
                totalOrders: allOrders.length,
                hasNext: endIndex < allOrders.length,
                hasPrev: startIndex > 0
            },
            stats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch orders',
            message: error.message
        });
    }
});

module.exports = router;