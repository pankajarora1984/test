const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory data store (in production, use a real database)
let products = [
    {
        id: '1',
        name: 'Banarasi Silk Saree',
        description: 'Traditional Banarasi silk saree with intricate gold work and zari embroidery. Perfect for weddings and special occasions.',
        price: 15999,
        originalPrice: 19999,
        category: 'silk-sarees',
        categoryName: 'Silk Sarees',
        images: [
            'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=400',
            'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=800'
        ],
        colors: ['Red', 'Gold', 'Maroon'],
        sizes: ['Free Size'],
        material: 'Pure Silk',
        occasion: ['Wedding', 'Festival', 'Party'],
        inStock: true,
        featured: true,
        rating: 4.8,
        reviews: 156,
        tags: ['banarasi', 'silk', 'traditional', 'zari'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '2',
        name: 'Designer Lehenga',
        description: 'Embroidered bridal lehenga with heavy dupatta and intricate stone work. Comes with matching choli and dupatta.',
        price: 25999,
        originalPrice: 32999,
        category: 'lehengas',
        categoryName: 'Lehengas',
        images: [
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800'
        ],
        colors: ['Pink', 'Red', 'Blue', 'Green'],
        sizes: ['S', 'M', 'L', 'XL'],
        material: 'Net with Silk Lining',
        occasion: ['Wedding', 'Reception', 'Engagement'],
        inStock: true,
        featured: true,
        rating: 4.9,
        reviews: 89,
        tags: ['lehenga', 'bridal', 'designer', 'embroidered'],
        createdAt: '2024-01-16T11:00:00Z',
        updatedAt: '2024-01-16T11:00:00Z'
    },
    {
        id: '3',
        name: 'Cotton Chanderi Saree',
        description: 'Lightweight chanderi saree perfect for daily wear and office. Comfortable and elegant with subtle border design.',
        price: 3999,
        originalPrice: 4999,
        category: 'cotton-sarees',
        categoryName: 'Cotton Sarees',
        images: [
            'https://images.unsplash.com/photo-1594736797933-d0f59aec2070?w=400',
            'https://images.unsplash.com/photo-1594736797933-d0f59aec2070?w=800'
        ],
        colors: ['White', 'Cream', 'Light Blue', 'Mint Green'],
        sizes: ['Free Size'],
        material: 'Cotton Chanderi',
        occasion: ['Daily Wear', 'Office', 'Casual'],
        inStock: true,
        featured: true,
        rating: 4.6,
        reviews: 203,
        tags: ['cotton', 'chanderi', 'daily-wear', 'comfortable'],
        createdAt: '2024-01-17T09:00:00Z',
        updatedAt: '2024-01-17T09:00:00Z'
    },
    {
        id: '4',
        name: 'Anarkali Suit',
        description: 'Flowing anarkali suit with embroidered details and matching dupatta. Perfect for festivals and parties.',
        price: 8999,
        originalPrice: 11999,
        category: 'salwar-suits',
        categoryName: 'Salwar Suits',
        images: [
            'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=400',
            'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=800'
        ],
        colors: ['Purple', 'Navy Blue', 'Emerald Green', 'Wine'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material: 'Georgette',
        occasion: ['Festival', 'Party', 'Function'],
        inStock: true,
        featured: true,
        rating: 4.7,
        reviews: 134,
        tags: ['anarkali', 'suit', 'embroidered', 'georgette'],
        createdAt: '2024-01-18T14:00:00Z',
        updatedAt: '2024-01-18T14:00:00Z'
    },
    {
        id: '5',
        name: 'Georgette Saree',
        description: 'Elegant georgette saree with sequin work and beautiful drape. Perfect for evening parties and functions.',
        price: 7999,
        originalPrice: 9999,
        category: 'georgette-sarees',
        categoryName: 'Georgette Sarees',
        images: [
            'https://images.unsplash.com/photo-1594736797933-d0f59aec2070?w=400',
            'https://images.unsplash.com/photo-1594736797933-d0f59aec2070?w=800'
        ],
        colors: ['Black', 'Navy Blue', 'Burgundy', 'Teal'],
        sizes: ['Free Size'],
        material: 'Pure Georgette',
        occasion: ['Party', 'Evening', 'Function'],
        inStock: true,
        featured: false,
        rating: 4.5,
        reviews: 98,
        tags: ['georgette', 'sequin', 'party-wear', 'elegant'],
        createdAt: '2024-01-19T16:00:00Z',
        updatedAt: '2024-01-19T16:00:00Z'
    },
    {
        id: '6',
        name: 'Sharara Set',
        description: 'Traditional sharara set with heavy dupatta and intricate embroidery. Perfect for weddings and special occasions.',
        price: 12999,
        originalPrice: 15999,
        category: 'sharara-sets',
        categoryName: 'Sharara Sets',
        images: [
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800'
        ],
        colors: ['Peach', 'Mint Green', 'Lavender', 'Coral'],
        sizes: ['S', 'M', 'L', 'XL'],
        material: 'Silk with Net Dupatta',
        occasion: ['Wedding', 'Mehndi', 'Sangeet'],
        inStock: true,
        featured: false,
        rating: 4.8,
        reviews: 67,
        tags: ['sharara', 'traditional', 'wedding', 'embroidered'],
        createdAt: '2024-01-20T12:00:00Z',
        updatedAt: '2024-01-20T12:00:00Z'
    }
];

// GET /api/products - Get all products with optional filtering
router.get('/', (req, res) => {
    try {
        let filteredProducts = [...products];
        
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
        const product = products.find(p => p.id === req.params.id);
        
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
        const categoryProducts = products.filter(product => 
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
        
        products.push(newProduct);
        
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
        const productIndex = products.findIndex(p => p.id === req.params.id);
        
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        
        const updatedProduct = {
            ...products[productIndex],
            ...req.body,
            id: req.params.id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
        };
        
        products[productIndex] = updatedProduct;
        
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
        const productIndex = products.findIndex(p => p.id === req.params.id);
        
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        
        const deletedProduct = products.splice(productIndex, 1)[0];
        
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