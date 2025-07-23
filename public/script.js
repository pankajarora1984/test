// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// API Helper Functions
class ChandanAPI {
    static async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    // Products API
    static async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/products${queryString ? '?' + queryString : ''}`);
    }
    
    static async getProduct(id) {
        return this.request(`/products/${id}`);
    }
    
    static async getProductsByCategory(category) {
        return this.request(`/products/category/${category}`);
    }
    
    // Categories API
    static async getCategories(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/categories${queryString ? '?' + queryString : ''}`);
    }
    
    static async getCategory(id) {
        return this.request(`/categories/${id}`);
    }
    
    // Contact API
    static async submitContact(contactData) {
        return this.request('/contact', {
            method: 'POST',
            body: JSON.stringify(contactData)
        });
    }
    
    static async getContactInfo() {
        return this.request('/contact/info');
    }
    
    static async subscribeNewsletter(email, name) {
        return this.request('/contact/newsletter', {
            method: 'POST',
            body: JSON.stringify({ email, name })
        });
    }
}

// Global state
let currentProducts = [];
let currentCategories = [];
let isLoading = false;

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const productGrid = document.querySelector('.product-grid');
const categoryGrid = document.querySelector('.category-grid');
const contactForm = document.querySelector('.contact-form');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Chandan Sarees Dynamic Website Loaded!');
    
    // Initialize components
    await Promise.all([
        loadCategories(),
        loadFeaturedProducts(),
        loadContactInfo()
    ]);
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize other features
    initializeAnimations();
    
    console.log('✅ Website initialization complete!');
});

// Load Categories
async function loadCategories() {
    try {
        showLoadingState(categoryGrid);
        
        const response = await ChandanAPI.getCategories({ featured: true });
        currentCategories = response.data;
        
        renderCategories(currentCategories);
        
    } catch (error) {
        console.error('Failed to load categories:', error);
        showErrorState(categoryGrid, 'Failed to load categories');
    }
}

// Load Featured Products
async function loadFeaturedProducts() {
    try {
        showLoadingState(productGrid);
        
        const response = await ChandanAPI.getProducts({ 
            featured: true, 
            limit: 6 
        });
        currentProducts = response.data;
        
        renderProducts(currentProducts);
        
    } catch (error) {
        console.error('Failed to load products:', error);
        showErrorState(productGrid, 'Failed to load products');
    }
}

// Load Contact Information
async function loadContactInfo() {
    try {
        const response = await ChandanAPI.getContactInfo();
        const contactInfo = response.data;
        
        // Update contact information in the DOM
        updateContactInfo(contactInfo);
        
    } catch (error) {
        console.error('Failed to load contact info:', error);
    }
}

// Render Categories
function renderCategories(categories) {
    if (!categoryGrid) return;
    
    const categoriesHTML = categories.map(category => `
        <div class="category-card" data-category="${category.slug}">
            <div class="placeholder-image">
                ${category.image ? 
                    `<img src="${category.image}" alt="${category.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` :
                    `<i class="fas fa-image"></i>`
                }
            </div>
            <h3>${category.name}</h3>
            <p>${category.description}</p>
            ${category.productCount > 0 ? `<span class="product-count">${category.productCount} items</span>` : ''}
        </div>
    `).join('');
    
    categoryGrid.innerHTML = categoriesHTML;
    
    // Add click event listeners to category cards
    categoryGrid.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const categorySlug = card.dataset.category;
            loadProductsByCategory(categorySlug);
        });
    });
}

// Render Products
function renderProducts(products) {
    if (!productGrid) return;
    
    const productsHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="placeholder-image product-placeholder">
                ${product.images && product.images.length > 0 ? 
                    `<img src="${product.images[0]}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
                    `<i class="fas fa-image"></i>`
                }
                ${product.originalPrice > product.price ? 
                    `<div class="discount-badge">₹${product.originalPrice - product.price} OFF</div>` : ''
                }
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <div class="price-container">
                        <div class="price">₹${product.price.toLocaleString('en-IN')}</div>
                        ${product.originalPrice > product.price ? 
                            `<div class="original-price">₹${product.originalPrice.toLocaleString('en-IN')}</div>` : ''
                        }
                    </div>
                    ${product.rating > 0 ? 
                        `<div class="rating">
                            <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                            <span class="rating-text">${product.rating} (${product.reviews})</span>
                        </div>` : ''
                    }
                </div>
                <div class="product-details">
                    <span class="material">${product.material}</span>
                    ${product.colors && product.colors.length > 0 ? 
                        `<span class="colors">${product.colors.length} colors</span>` : ''
                    }
                </div>
                <button class="add-to-cart" data-product-id="${product.id}">
                    ${product.inStock ? 'View Details' : 'Out of Stock'}
                </button>
            </div>
        </div>
    `).join('');
    
    productGrid.innerHTML = productsHTML;
    
    // Add click event listeners to product cards
    productGrid.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = button.dataset.productId;
            viewProductDetails(productId);
        });
    });
}

// Load Products by Category
async function loadProductsByCategory(categorySlug) {
    try {
        showLoadingState(productGrid);
        
        const response = await ChandanAPI.getProductsByCategory(categorySlug);
        const products = response.data;
        
        renderProducts(products);
        
        // Scroll to products section
        document.querySelector('#collections').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        showNotification(`Showing ${products.length} ${categorySlug.replace('-', ' ')}`, 'success');
        
    } catch (error) {
        console.error('Failed to load category products:', error);
        showErrorState(productGrid, 'Failed to load products');
    }
}

// View Product Details
async function viewProductDetails(productId) {
    try {
        const response = await ChandanAPI.getProduct(productId);
        const product = response.data;
        
        // Create modal or navigate to product page
        showProductModal(product);
        
    } catch (error) {
        console.error('Failed to load product details:', error);
        showNotification('Failed to load product details', 'error');
    }
}

// Show Product Modal
function showProductModal(product) {
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="product-details-modal">
                <div class="product-images">
                    ${product.images && product.images.length > 0 ? 
                        `<img src="${product.images[0]}" alt="${product.name}">` :
                        `<div class="placeholder-image"><i class="fas fa-image"></i></div>`
                    }
                </div>
                <div class="product-info-modal">
                    <h2>${product.name}</h2>
                    <p class="description">${product.description}</p>
                    <div class="price-container">
                        <span class="price">₹${product.price.toLocaleString('en-IN')}</span>
                        ${product.originalPrice > product.price ? 
                            `<span class="original-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''
                        }
                    </div>
                    ${product.rating > 0 ? 
                        `<div class="rating">
                            <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                            <span>${product.rating} (${product.reviews} reviews)</span>
                        </div>` : ''
                    }
                    <div class="product-attributes">
                        <p><strong>Material:</strong> ${product.material}</p>
                        <p><strong>Category:</strong> ${product.categoryName}</p>
                        ${product.colors && product.colors.length > 0 ? 
                            `<p><strong>Available Colors:</strong> ${product.colors.join(', ')}</p>` : ''
                        }
                        ${product.sizes && product.sizes.length > 0 ? 
                            `<p><strong>Available Sizes:</strong> ${product.sizes.join(', ')}</p>` : ''
                        }
                        ${product.occasion && product.occasion.length > 0 ? 
                            `<p><strong>Occasions:</strong> ${product.occasion.join(', ')}</p>` : ''
                        }
                    </div>
                    <div class="modal-actions">
                        <button class="btn-primary">Contact for Order</button>
                        <button class="btn-secondary">Add to Wishlist</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    const modalStyles = `
        .product-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
        }
        .modal-content {
            position: relative;
            background: white;
            border-radius: 15px;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            margin: 20px;
        }
        .modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            z-index: 1;
        }
        .product-details-modal {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            padding: 2rem;
        }
        .product-images img {
            width: 100%;
            border-radius: 10px;
        }
        .product-info-modal h2 {
            color: var(--primary-color);
            margin-bottom: 1rem;
        }
        .modal-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        .btn-primary, .btn-secondary {
            padding: 1rem 2rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            flex: 1;
        }
        .btn-primary {
            background: var(--primary-color);
            color: white;
        }
        .btn-secondary {
            background: #f0f0f0;
            color: var(--text-dark);
        }
        @media (max-width: 768px) {
            .product-details-modal {
                grid-template-columns: 1fr;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);
    
    // Close modal events
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(styleSheet);
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(styleSheet);
    });
}

// Update Contact Information
function updateContactInfo(contactInfo) {
    // Update address
    const addressElements = document.querySelectorAll('[data-contact="address"]');
    addressElements.forEach(el => {
        el.textContent = contactInfo.address.full;
    });
    
    // Update phone numbers
    const phoneElements = document.querySelectorAll('[data-contact="phone"]');
    phoneElements.forEach(el => {
        el.innerHTML = contactInfo.contact.phones.map(phone => phone.number).join('<br>');
    });
    
    // Update emails
    const emailElements = document.querySelectorAll('[data-contact="email"]');
    emailElements.forEach(el => {
        el.innerHTML = contactInfo.contact.emails.map(email => email.email).join('<br>');
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile Navigation Toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Contact Form
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
    
    // CTA Button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            document.querySelector('#collections').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
    
    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Social Media Click Handlers
    document.querySelectorAll('.social-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = link.querySelector('i').className.includes('facebook') ? 'Facebook' :
                            link.querySelector('i').className.includes('instagram') ? 'Instagram' :
                            link.querySelector('i').className.includes('whatsapp') ? 'WhatsApp' :
                            link.querySelector('i').className.includes('youtube') ? 'YouTube' : 'Social Media';
            
            showNotification(`${platform} page will open soon!`, 'success');
        });
    });
}

// Handle Contact Form Submit
async function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contactData = {
        name: formData.get('name') || e.target.querySelector('input[type="text"]').value,
        email: formData.get('email') || e.target.querySelector('input[type="email"]').value,
        phone: formData.get('phone') || e.target.querySelector('input[type="tel"]').value,
        message: formData.get('message') || e.target.querySelector('textarea').value
    };
    
    // Client-side validation
    if (!contactData.name || !contactData.email || !contactData.message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    try {
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        const response = await ChandanAPI.submitContact(contactData);
        
        // Reset form
        e.target.reset();
        
        showNotification(response.message, 'success');
        
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
    } catch (error) {
        console.error('Contact form submission failed:', error);
        showNotification(error.message || 'Failed to send message. Please try again.', 'error');
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.textContent = 'Send Message';
        submitButton.disabled = false;
    }
}

// Loading and Error States
function showLoadingState(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    `;
    
    // Add loading styles if not present
    if (!document.querySelector('#loading-styles')) {
        const loadingStyles = document.createElement('style');
        loadingStyles.id = 'loading-styles';
        loadingStyles.textContent = `
            .loading-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 3rem;
                grid-column: 1 / -1;
            }
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 1rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .error-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 3rem;
                grid-column: 1 / -1;
                color: var(--text-light);
            }
            .error-state i {
                font-size: 3rem;
                color: #f44336;
                margin-bottom: 1rem;
            }
        `;
        document.head.appendChild(loadingStyles);
    }
}

function showErrorState(container, message = 'Something went wrong') {
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button onclick="location.reload()" class="retry-button">Try Again</button>
        </div>
    `;
}

// Initialize Animations and Other Features
function initializeAnimations() {
    // Navbar Background on Scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = '#FFFFFF';
            navbar.style.backdropFilter = 'none';
        }
    });
    
    // Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.category-card, .product-card, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Scroll to top functionality
    createScrollToTopButton();
}

// Notification System (keeping the original implementation)
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style notification
    notification.style.position = 'fixed';
    notification.style.top = '100px';
    notification.style.right = '20px';
    notification.style.background = type === 'success' ? '#4CAF50' : '#f44336';
    notification.style.color = 'white';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    notification.style.zIndex = '10000';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'all 0.3s ease';
    notification.style.maxWidth = '300px';
    notification.style.fontSize = '0.9rem';
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Scroll to top button
function createScrollToTopButton() {
    let scrollToTopButton = document.createElement('button');
    scrollToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopButton.className = 'scroll-to-top';
    
    // Style the button
    scrollToTopButton.style.position = 'fixed';
    scrollToTopButton.style.bottom = '30px';
    scrollToTopButton.style.right = '30px';
    scrollToTopButton.style.width = '50px';
    scrollToTopButton.style.height = '50px';
    scrollToTopButton.style.borderRadius = '50%';
    scrollToTopButton.style.background = 'linear-gradient(135deg, #8B0000, #A0522D)';
    scrollToTopButton.style.color = 'white';
    scrollToTopButton.style.border = 'none';
    scrollToTopButton.style.cursor = 'pointer';
    scrollToTopButton.style.opacity = '0';
    scrollToTopButton.style.visibility = 'hidden';
    scrollToTopButton.style.transition = 'all 0.3s ease';
    scrollToTopButton.style.zIndex = '1000';
    scrollToTopButton.style.fontSize = '1.2rem';
    scrollToTopButton.style.boxShadow = '0 4px 12px rgba(139, 0, 0, 0.3)';
    
    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(scrollToTopButton);
    
    // Show/hide scroll to top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollToTopButton.style.opacity = '1';
            scrollToTopButton.style.visibility = 'visible';
        } else {
            scrollToTopButton.style.opacity = '0';
            scrollToTopButton.style.visibility = 'hidden';
        }
    });
}

// Export API for external use
window.ChandanAPI = ChandanAPI;