const express = require('express');
const router = express.Router();

// In-memory categories data
const categories = [
    {
        id: '1',
        name: 'Silk Sarees',
        slug: 'silk-sarees',
        description: 'Luxurious silk sarees for special occasions and festivals',
        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=400',
        productCount: 0,
        featured: true,
        tags: ['silk', 'traditional', 'wedding', 'festival'],
        createdAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '2',
        name: 'Cotton Sarees',
        slug: 'cotton-sarees',
        description: 'Comfortable daily wear cotton sarees for everyday elegance',
        image: 'https://images.unsplash.com/photo-1594736797933-d0f59aec2070?w=400',
        productCount: 0,
        featured: true,
        tags: ['cotton', 'daily-wear', 'comfortable', 'office'],
        createdAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '3',
        name: 'Lehengas',
        slug: 'lehengas',
        description: 'Stunning lehengas for weddings, receptions and grand celebrations',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
        productCount: 0,
        featured: true,
        tags: ['lehenga', 'bridal', 'wedding', 'reception'],
        createdAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '4',
        name: 'Salwar Suits',
        slug: 'salwar-suits',
        description: 'Elegant salwar suits and anarkali sets for every occasion',
        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=400',
        productCount: 0,
        featured: true,
        tags: ['salwar', 'suit', 'anarkali', 'party'],
        createdAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '5',
        name: 'Georgette Sarees',
        slug: 'georgette-sarees',
        description: 'Elegant georgette sarees perfect for parties and evening functions',
        image: 'https://images.unsplash.com/photo-1594736797933-d0f59aec2070?w=400',
        productCount: 0,
        featured: false,
        tags: ['georgette', 'party', 'evening', 'elegant'],
        createdAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '6',
        name: 'Sharara Sets',
        slug: 'sharara-sets',
        description: 'Traditional sharara sets with heavy work for special occasions',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
        productCount: 0,
        featured: false,
        tags: ['sharara', 'traditional', 'heavy-work', 'special'],
        createdAt: '2024-01-15T10:00:00Z'
    }
];

// Helper function to get product count for each category
const updateProductCounts = () => {
    // This would typically query the database
    // For now, we'll simulate it
    const productsByCategory = {
        'silk-sarees': 1,
        'cotton-sarees': 1,
        'lehengas': 1,
        'salwar-suits': 1,
        'georgette-sarees': 1,
        'sharara-sets': 1
    };
    
    categories.forEach(category => {
        category.productCount = productsByCategory[category.slug] || 0;
    });
};

// GET /api/categories - Get all categories
router.get('/', (req, res) => {
    try {
        updateProductCounts();
        
        let filteredCategories = [...categories];
        
        // Filter by featured
        if (req.query.featured === 'true') {
            filteredCategories = filteredCategories.filter(category => category.featured);
        }
        
        // Sort categories
        if (req.query.sortBy) {
            switch (req.query.sortBy) {
                case 'name':
                    filteredCategories.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'productCount':
                    filteredCategories.sort((a, b) => b.productCount - a.productCount);
                    break;
                default:
                    // Default sort by featured first, then by name
                    filteredCategories.sort((a, b) => {
                        if (a.featured && !b.featured) return -1;
                        if (!a.featured && b.featured) return 1;
                        return a.name.localeCompare(b.name);
                    });
            }
        }
        
        res.json({
            success: true,
            data: filteredCategories,
            count: filteredCategories.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories',
            message: error.message
        });
    }
});

// GET /api/categories/:id - Get category by ID
router.get('/:id', (req, res) => {
    try {
        updateProductCounts();
        
        const category = categories.find(c => c.id === req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch category',
            message: error.message
        });
    }
});

// GET /api/categories/slug/:slug - Get category by slug
router.get('/slug/:slug', (req, res) => {
    try {
        updateProductCounts();
        
        const category = categories.find(c => c.slug === req.params.slug);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch category',
            message: error.message
        });
    }
});

// POST /api/categories - Create new category (admin)
router.post('/', (req, res) => {
    try {
        const { name, description, image, featured = false, tags = [] } = req.body;
        
        // Validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, description'
            });
        }
        
        // Generate slug from name
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        // Check if slug already exists
        const existingCategory = categories.find(c => c.slug === slug);
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                error: 'Category with this name already exists'
            });
        }
        
        const newCategory = {
            id: (categories.length + 1).toString(),
            name,
            slug,
            description,
            image: image || '',
            productCount: 0,
            featured,
            tags,
            createdAt: new Date().toISOString()
        };
        
        categories.push(newCategory);
        
        res.status(201).json({
            success: true,
            data: newCategory,
            message: 'Category created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create category',
            message: error.message
        });
    }
});

// PUT /api/categories/:id - Update category (admin)
router.put('/:id', (req, res) => {
    try {
        const categoryIndex = categories.findIndex(c => c.id === req.params.id);
        
        if (categoryIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }
        
        const { name, description, image, featured, tags } = req.body;
        const category = categories[categoryIndex];
        
        // Update slug if name changed
        let slug = category.slug;
        if (name && name !== category.name) {
            slug = name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            
            // Check if new slug conflicts with existing category
            const existingCategory = categories.find(c => c.slug === slug && c.id !== req.params.id);
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    error: 'Category with this name already exists'
                });
            }
        }
        
        const updatedCategory = {
            ...category,
            ...(name && { name }),
            ...(description && { description }),
            ...(image !== undefined && { image }),
            ...(featured !== undefined && { featured }),
            ...(tags && { tags }),
            slug,
            updatedAt: new Date().toISOString()
        };
        
        categories[categoryIndex] = updatedCategory;
        
        res.json({
            success: true,
            data: updatedCategory,
            message: 'Category updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update category',
            message: error.message
        });
    }
});

// DELETE /api/categories/:id - Delete category (admin)
router.delete('/:id', (req, res) => {
    try {
        const categoryIndex = categories.findIndex(c => c.id === req.params.id);
        
        if (categoryIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }
        
        // Check if category has products (in real app, check database)
        const category = categories[categoryIndex];
        if (category.productCount > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete category with existing products'
            });
        }
        
        const deletedCategory = categories.splice(categoryIndex, 1)[0];
        
        res.json({
            success: true,
            data: deletedCategory,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete category',
            message: error.message
        });
    }
});

module.exports = router;