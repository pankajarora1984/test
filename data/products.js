// Shared products data module
const products = [
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

// Helper function to find product by ID
const findProductById = (id) => {
    return products.find(product => product.id === id);
};

// Helper function to get products by category
const getProductsByCategory = (category) => {
    return products.filter(product => product.category === category);
};

// Helper function to get featured products
const getFeaturedProducts = () => {
    return products.filter(product => product.featured);
};

module.exports = {
    products,
    findProductById,
    getProductsByCategory,
    getFeaturedProducts
};