const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Import shared products data
const { products } = require('../data/products');

// Use the imported products data (in production, this would be from database)
let productsData = [...products];

// GET /api/products - Get all products with optional filtering
router.get('/', (req, res) => {
    try {
        let filteredProducts = [...productsData];
        
        // Filter by category
        if (req.query.category) {
            filteredProducts = filteredProducts.filter(product => 
                product.category.toLowerCase() === req.query.category.toLowerCase()
            );
        }
        
        // Filter by featured
        if (req.query.featured === 'true') {
            filteredProducts = filteredProducts.filter(product => product.featured);
        }
        
        // Filter by in stock
        if (req.query.inStock === 'true') {
            filteredProducts = filteredProducts.filter(product => product.inStock);
        }
        
        // Filter by price range
        if (req.query.minPrice) {
            filteredProducts = filteredProducts.filter(product => 
                product.price >= parseInt(req.query.minPrice)
            );
        }
        if (req.query.maxPrice) {
            filteredProducts = filteredProducts.filter(product => 
                product.price <= parseInt(req.query.maxPrice)
            );
        }
        
        // Search by name or description
        if (req.query.search) {
            const searchTerm = req.query.search.toLowerCase();
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        // Sort products
        if (req.query.sortBy) {
            switch (req.query.sortBy) {
                case 'price_low':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price_high':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    filteredProducts.sort((a, b) => b.rating - a.rating);
                    break;
                case 'newest':
                    filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                case 'name':
                    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                default:
                    // Default sort by featured first, then by newest
                    filteredProducts.sort((a, b) => {
                        if (a.featured && !b.featured) return -1;
                        if (!a.featured && b.featured) return 1;
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
            }
        }
        
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: paginatedProducts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(filteredProducts.length / limit),
                totalProducts: filteredProducts.length,
                hasNext: endIndex < filteredProducts.length,
                hasPrev: startIndex > 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products',
            message: error.message
        });
    }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', (req, res) => {
    try {
        const product = productsData.find(p => p.id === req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch product',
            message: error.message
        });
    }
});

// GET /api/products/category/:category - Get products by category
router.get('/category/:category', (req, res) => {
    try {
        const categoryProducts = productsData.filter(product => 
            product.category.toLowerCase() === req.params.category.toLowerCase()
        );
        
        res.json({
            success: true,
            data: categoryProducts,
            count: categoryProducts.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products by category',
            message: error.message
        });
    }
});

// POST /api/products - Create new product (admin)
router.post('/', (req, res) => {
    try {
        const {
            name,
            description,
            price,
            originalPrice,
            category,
            categoryName,
            images,
            colors,
            sizes,
            material,
            occasion,
            tags
        } = req.body;
        
        // Validation
        if (!name || !description || !price || !category) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, description, price, category'
            });
        }
        
        const newProduct = {
            id: uuidv4(),
            name,
            description,
            price: parseInt(price),
            originalPrice: originalPrice ? parseInt(originalPrice) : parseInt(price),
            category,
            categoryName: categoryName || category,
            images: images || [],
            colors: colors || [],
            sizes: sizes || [],
            material: material || '',
            occasion: occasion || [],
            inStock: true,
            featured: false,
            rating: 0,
            reviews: 0,
            tags: tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        productsData.push(newProduct);
        
        res.status(201).json({
            success: true,
            data: newProduct,
            message: 'Product created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create product',
            message: error.message
        });
    }
});

// PUT /api/products/:id - Update product (admin)
router.put('/:id', (req, res) => {
    try {
                const productIndex = productsData.findIndex(p => p.id === req.params.id);

        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        const updatedProduct = {
            ...productsData[productIndex],
            ...req.body,
            id: req.params.id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
        };

        productsData[productIndex] = updatedProduct;
        
        res.json({
            success: true,
            data: updatedProduct,
            message: 'Product updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update product',
            message: error.message
        });
    }
});

// DELETE /api/products/:id - Delete product (admin)
router.delete('/:id', (req, res) => {
    try {
                const productIndex = productsData.findIndex(p => p.id === req.params.id);

        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        const deletedProduct = productsData.splice(productIndex, 1)[0];
        
        res.json({
            success: true,
            data: deletedProduct,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete product',
            message: error.message
        });
    }
});

module.exports = router;