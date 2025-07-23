const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory cart storage (in production, use database with user sessions)
let carts = new Map(); // userId -> cart object

// Helper function to get or create cart
const getCart = (userId) => {
    if (!carts.has(userId)) {
        carts.set(userId, {
            id: uuidv4(),
            userId,
            items: [],
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
    return carts.get(userId);
};

// Helper function to calculate cart totals
const calculateCartTotals = (cart) => {
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.tax = Math.round(cart.subtotal * 0.18); // 18% GST
    cart.shipping = cart.subtotal > 2000 ? 0 : 100; // Free shipping above ₹2000
    cart.total = cart.subtotal + cart.tax + cart.shipping;
    cart.updatedAt = new Date().toISOString();
};

// GET /api/cart/:userId - Get user's cart
router.get('/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const cart = getCart(userId);
        
        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cart',
            message: error.message
        });
    }
});

// POST /api/cart/:userId/add - Add item to cart
router.post('/:userId/add', (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, quantity = 1, selectedSize, selectedColor } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'Product ID is required'
            });
        }

        // Get product details (in real app, fetch from products service)
        const { findProductById } = require('../data/products');
        const productData = findProductById(productId);
        
        if (!productData) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        const cart = getCart(userId);
        
        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(item => 
            item.productId === productId && 
            item.selectedSize === selectedSize && 
            item.selectedColor === selectedColor
        );

        if (existingItemIndex > -1) {
            // Update quantity of existing item
            cart.items[existingItemIndex].quantity += parseInt(quantity);
        } else {
            // Add new item to cart
            const cartItem = {
                id: uuidv4(),
                productId,
                name: productData.name,
                price: productData.price,
                originalPrice: productData.originalPrice,
                image: productData.images?.[0] || '',
                selectedSize: selectedSize || 'Free Size',
                selectedColor: selectedColor || 'Default',
                quantity: parseInt(quantity),
                addedAt: new Date().toISOString()
            };
            cart.items.push(cartItem);
        }

        calculateCartTotals(cart);

        res.json({
            success: true,
            data: cart,
            message: `${productData.name} added to cart`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to add item to cart',
            message: error.message
        });
    }
});

// PUT /api/cart/:userId/update/:itemId - Update cart item quantity
router.put('/:userId/update/:itemId', (req, res) => {
    try {
        const { userId, itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                error: 'Valid quantity is required (minimum 1)'
            });
        }

        const cart = getCart(userId);
        const itemIndex = cart.items.findIndex(item => item.id === itemId);

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Cart item not found'
            });
        }

        cart.items[itemIndex].quantity = parseInt(quantity);
        calculateCartTotals(cart);

        res.json({
            success: true,
            data: cart,
            message: 'Cart updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update cart item',
            message: error.message
        });
    }
});

// DELETE /api/cart/:userId/remove/:itemId - Remove item from cart
router.delete('/:userId/remove/:itemId', (req, res) => {
    try {
        const { userId, itemId } = req.params;
        const cart = getCart(userId);
        
        const itemIndex = cart.items.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Cart item not found'
            });
        }

        const removedItem = cart.items.splice(itemIndex, 1)[0];
        calculateCartTotals(cart);

        res.json({
            success: true,
            data: cart,
            message: `${removedItem.name} removed from cart`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to remove cart item',
            message: error.message
        });
    }
});

// DELETE /api/cart/:userId/clear - Clear entire cart
router.delete('/:userId/clear', (req, res) => {
    try {
        const { userId } = req.params;
        const cart = getCart(userId);
        
        cart.items = [];
        calculateCartTotals(cart);

        res.json({
            success: true,
            data: cart,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to clear cart',
            message: error.message
        });
    }
});

// POST /api/cart/:userId/apply-coupon - Apply discount coupon
router.post('/:userId/apply-coupon', (req, res) => {
    try {
        const { userId } = req.params;
        const { couponCode } = req.body;

        if (!couponCode) {
            return res.status(400).json({
                success: false,
                error: 'Coupon code is required'
            });
        }

        const cart = getCart(userId);

        // Sample coupons (in production, fetch from database)
        const coupons = {
            'WELCOME10': { type: 'percentage', value: 10, minAmount: 1000 },
            'FLAT500': { type: 'fixed', value: 500, minAmount: 2000 },
            'FESTIVAL20': { type: 'percentage', value: 20, minAmount: 5000 }
        };

        const coupon = coupons[couponCode.toUpperCase()];
        
        if (!coupon) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coupon code'
            });
        }

        if (cart.subtotal < coupon.minAmount) {
            return res.status(400).json({
                success: false,
                error: `Minimum order amount of ₹${coupon.minAmount} required for this coupon`
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === 'percentage') {
            discount = Math.round((cart.subtotal * coupon.value) / 100);
        } else {
            discount = coupon.value;
        }

        cart.coupon = {
            code: couponCode.toUpperCase(),
            type: coupon.type,
            value: coupon.value,
            discount
        };

        // Recalculate totals with discount
        cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cart.tax = Math.round((cart.subtotal - discount) * 0.18);
        cart.shipping = cart.subtotal > 2000 ? 0 : 100;
        cart.total = cart.subtotal - discount + cart.tax + cart.shipping;
        cart.updatedAt = new Date().toISOString();

        res.json({
            success: true,
            data: cart,
            message: `Coupon ${couponCode} applied successfully! You saved ₹${discount}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to apply coupon',
            message: error.message
        });
    }
});

// GET /api/cart/count/:userId - Get cart items count
router.get('/count/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const cart = getCart(userId);
        
        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

        res.json({
            success: true,
            data: {
                count: itemCount,
                items: cart.items.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get cart count',
            message: error.message
        });
    }
});

module.exports = router;