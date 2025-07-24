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
    
    // Cart API
    static async getCart(userId) {
        return this.request(`/cart/${userId}`);
    }
    
    static async addToCart(userId, productData) {
        return this.request(`/cart/${userId}/add`, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }
    
    static async updateCartItem(userId, itemId, quantity) {
        return this.request(`/cart/${userId}/update/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
    }
    
    static async removeFromCart(userId, itemId) {
        return this.request(`/cart/${userId}/remove/${itemId}`, {
            method: 'DELETE'
        });
    }
    
    static async clearCart(userId) {
        return this.request(`/cart/${userId}/clear`, {
            method: 'DELETE'
        });
    }
    
    static async applyCoupon(userId, couponCode) {
        return this.request(`/cart/${userId}/apply-coupon`, {
            method: 'POST',
            body: JSON.stringify({ couponCode })
        });
    }
    
    static async getCartCount(userId) {
        return this.request(`/cart/count/${userId}`);
    }
    
    // Orders API
    static async createOrder(orderData) {
        return this.request('/orders/create', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }
    
    static async verifyPayment(paymentData) {
        return this.request('/orders/verify-payment', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }
    
    static async getUserOrders(userId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/orders/${userId}${queryString ? '?' + queryString : ''}`);
    }
    
    static async getOrderDetails(orderId) {
        return this.request(`/orders/detail/${orderId}`);
    }
    
    static async cancelOrder(orderId, reason) {
        return this.request(`/orders/${orderId}/cancel`, {
            method: 'PUT',
            body: JSON.stringify({ reason })
        });
    }
    
    static async trackOrder(orderNumber) {
        return this.request(`/orders/track/${orderNumber}`);
    }
}

// Global state
let currentProducts = [];
let currentCategories = [];
let currentCart = null;
let currentUser = { id: 'guest_' + Date.now() }; // Simple user simulation
let isLoading = false;
let razorpayInstance = null;

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
        loadContactInfo(),
        loadCart()
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

// Load Cart
async function loadCart() {
    try {
        const response = await ChandanAPI.getCart(currentUser.id);
        currentCart = response.data;
        updateCartUI();
        
    } catch (error) {
        console.error('Failed to load cart:', error);
        // Initialize empty cart if loading fails
        currentCart = {
            items: [],
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0
        };
        updateCartUI();
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
                <div class="product-actions">
                    <button class="view-details" data-product-id="${product.id}">
                        View Details
                    </button>
                    <button class="add-to-cart" data-product-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
                        ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    productGrid.innerHTML = productsHTML;
    
    // Add click event listeners to product cards
    productGrid.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = button.dataset.productId;
            viewProductDetails(productId);
        });
    });
    
    productGrid.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = button.dataset.productId;
            addToCart(productId);
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

// Add to Cart function
async function addToCart(productId, quantity = 1, selectedSize = 'Free Size', selectedColor = 'Default') {
    try {
        const response = await ChandanAPI.addToCart(currentUser.id, {
            productId,
            quantity,
            selectedSize,
            selectedColor
        });
        
        currentCart = response.data;
        updateCartUI();
        showNotification(response.message, 'success');
        
    } catch (error) {
        console.error('Failed to add to cart:', error);
        showNotification(error.message || 'Failed to add item to cart', 'error');
    }
}

// Update Cart UI
function updateCartUI() {
    if (!currentCart) return;
    
    // Update cart count in header
    const cartCount = currentCart.items.reduce((sum, item) => sum + item.quantity, 0);
    updateCartCount(cartCount);
    
    // Update cart dropdown if it exists
    updateCartDropdown();
}

// Update cart count display
function updateCartCount(count) {
    let cartCountElement = document.querySelector('.cart-count');
    
    if (!cartCountElement) {
        // Create cart icon and count in navigation
        const cartHTML = `
            <div class="cart-container">
                <button class="cart-button" onclick="toggleCartDropdown()">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count">${count}</span>
                </button>
            </div>
        `;
        
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.insertAdjacentHTML('afterend', cartHTML);
            cartCountElement = document.querySelector('.cart-count');
        }
    }
    
    if (cartCountElement) {
        cartCountElement.textContent = count;
        cartCountElement.style.display = count > 0 ? 'block' : 'none';
    }
}

// Toggle cart dropdown
function toggleCartDropdown() {
    let cartDropdown = document.querySelector('.cart-dropdown');
    
    if (!cartDropdown) {
        createCartDropdown();
        cartDropdown = document.querySelector('.cart-dropdown');
    }
    
    cartDropdown.style.display = cartDropdown.style.display === 'block' ? 'none' : 'block';
}

// Create cart dropdown
function createCartDropdown() {
    const cartContainer = document.querySelector('.cart-container');
    if (!cartContainer) return;
    
    const cartDropdownHTML = `
        <div class="cart-dropdown">
            <div class="cart-header">
                <h3>Shopping Cart</h3>
                <button class="close-cart" onclick="toggleCartDropdown()">×</button>
            </div>
            <div class="cart-items"></div>
            <div class="cart-footer">
                <div class="cart-total">
                    <strong>Total: ₹<span class="total-amount">0</span></strong>
                </div>
                <div class="cart-actions">
                    <button class="btn-secondary" onclick="viewCart()">View Cart</button>
                    <button class="btn-primary" onclick="proceedToCheckout()">Checkout</button>
                </div>
            </div>
        </div>
    `;
    
    cartContainer.insertAdjacentHTML('beforeend', cartDropdownHTML);
    updateCartDropdown();
}

// Update cart dropdown content
function updateCartDropdown() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalAmountElement = document.querySelector('.total-amount');
    
    if (!cartItemsContainer || !currentCart) return;
    
    if (currentCart.items.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        const cartItemsHTML = currentCart.items.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>₹${item.price.toLocaleString('en-IN')}</p>
                    <p>Size: ${item.selectedSize}, Color: ${item.selectedColor}</p>
                    <div class="quantity-controls">
                        <button onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.id}')">×</button>
            </div>
        `).join('');
        cartItemsContainer.innerHTML = cartItemsHTML;
    }
    
    if (totalAmountElement) {
        totalAmountElement.textContent = currentCart.total.toLocaleString('en-IN');
    }
}

// Update cart item quantity
async function updateCartItemQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(itemId);
        return;
    }
    
    try {
        const response = await ChandanAPI.updateCartItem(currentUser.id, itemId, newQuantity);
        currentCart = response.data;
        updateCartUI();
        
    } catch (error) {
        console.error('Failed to update cart item:', error);
        showNotification('Failed to update item quantity', 'error');
    }
}

// Remove from cart
async function removeFromCart(itemId) {
    try {
        const response = await ChandanAPI.removeFromCart(currentUser.id, itemId);
        currentCart = response.data;
        updateCartUI();
        showNotification(response.message, 'success');
        
    } catch (error) {
        console.error('Failed to remove from cart:', error);
        showNotification('Failed to remove item from cart', 'error');
    }
}

// View full cart page
function viewCart() {
    toggleCartDropdown();
    showCartModal();
}

// Show cart modal
function showCartModal() {
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content cart-modal-content">
            <div class="cart-modal-header">
                <h2>Shopping Cart</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="cart-modal-body">
                ${renderCartItems()}
                ${renderCartSummary()}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    addCartModalStyles();
    
    // Close modal events
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Render cart items for modal
function renderCartItems() {
    if (!currentCart || currentCart.items.length === 0) {
        return '<div class="empty-cart-message">Your cart is empty</div>';
    }
    
    return `
        <div class="cart-items-list">
            ${currentCart.items.map(item => `
                <div class="cart-item-full" data-item-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</p>
                        <p class="cart-item-options">Size: ${item.selectedSize} | Color: ${item.selectedColor}</p>
                        <div class="quantity-controls">
                            <button onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <input type="number" value="${item.quantity}" min="1" onchange="updateCartItemQuantity('${item.id}', this.value)">
                            <button onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <div class="cart-item-total">
                        <p>₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        <button class="remove-item" onclick="removeFromCart('${item.id}')">Remove</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render cart summary
function renderCartSummary() {
    if (!currentCart || currentCart.items.length === 0) {
        return '';
    }
    
    return `
        <div class="cart-summary">
            <h3>Order Summary</h3>
            <div class="summary-line">
                <span>Subtotal:</span>
                <span>₹${currentCart.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div class="summary-line">
                <span>Tax (18% GST):</span>
                <span>₹${currentCart.tax.toLocaleString('en-IN')}</span>
            </div>
            <div class="summary-line">
                <span>Shipping:</span>
                <span>${currentCart.shipping === 0 ? 'FREE' : '₹' + currentCart.shipping.toLocaleString('en-IN')}</span>
            </div>
            ${currentCart.coupon ? `
                <div class="summary-line discount">
                    <span>Discount (${currentCart.coupon.code}):</span>
                    <span>-₹${currentCart.coupon.discount.toLocaleString('en-IN')}</span>
                </div>
            ` : ''}
            <div class="summary-line total">
                <span><strong>Total:</strong></span>
                <span><strong>₹${currentCart.total.toLocaleString('en-IN')}</strong></span>
            </div>
            <div class="coupon-section">
                <input type="text" id="couponCode" placeholder="Enter coupon code">
                <button onclick="applyCoupon()">Apply</button>
            </div>
            <div class="cart-actions">
                <button class="btn-secondary" onclick="clearCart()">Clear Cart</button>
                <button class="btn-primary" onclick="proceedToCheckout()">Proceed to Checkout</button>
            </div>
        </div>
    `;
}

// Apply coupon
async function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    const couponCode = couponInput.value.trim();
    
    if (!couponCode) {
        showNotification('Please enter a coupon code', 'error');
        return;
    }
    
    try {
        const response = await ChandanAPI.applyCoupon(currentUser.id, couponCode);
        currentCart = response.data;
        updateCartUI();
        showNotification(response.message, 'success');
        
        // Refresh cart modal if open
        const cartModal = document.querySelector('.cart-modal');
        if (cartModal) {
            cartModal.remove();
            showCartModal();
        }
        
    } catch (error) {
        console.error('Failed to apply coupon:', error);
        showNotification(error.message || 'Invalid coupon code', 'error');
    }
}

// Clear cart
async function clearCart() {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    
    try {
        const response = await ChandanAPI.clearCart(currentUser.id);
        currentCart = response.data;
        updateCartUI();
        showNotification(response.message, 'success');
        
        // Close cart modal if open
        const cartModal = document.querySelector('.cart-modal');
        if (cartModal) {
            cartModal.remove();
        }
        
    } catch (error) {
        console.error('Failed to clear cart:', error);
        showNotification('Failed to clear cart', 'error');
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (!currentCart || currentCart.items.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    // Close any open modals
    const cartModal = document.querySelector('.cart-modal');
    if (cartModal) {
        cartModal.remove();
    }
    
    showCheckoutModal();
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

// Show checkout modal
function showCheckoutModal() {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content checkout-modal-content">
            <div class="checkout-header">
                <h2>Checkout</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="checkout-body">
                <div class="checkout-form">
                    <div class="shipping-section">
                        <h3>Shipping Address</h3>
                        <form id="shippingForm">
                            <input type="text" name="fullName" placeholder="Full Name" required>
                            <input type="email" name="email" placeholder="Email Address" required>
                            <input type="tel" name="phone" placeholder="Phone Number" required>
                            <textarea name="address" placeholder="Street Address" required></textarea>
                            <div class="address-row">
                                <input type="text" name="city" placeholder="City" required>
                                <input type="text" name="state" placeholder="State" required>
                                <input type="text" name="pincode" placeholder="PIN Code" required>
                            </div>
                        </form>
                    </div>
                    <div class="payment-section">
                        <h3>Payment Method</h3>
                        <div class="payment-options">
                            <label>
                                <input type="radio" name="paymentMethod" value="razorpay" checked>
                                <span>Pay with Razorpay (Cards, UPI, Net Banking)</span>
                            </label>
                            <label>
                                <input type="radio" name="paymentMethod" value="cod">
                                <span>Cash on Delivery</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="order-summary">
                    <h3>Order Summary</h3>
                    <div class="checkout-items">
                        ${renderCheckoutItems()}
                    </div>
                    <div class="checkout-totals">
                        ${renderCheckoutTotals()}
                    </div>
                    <button class="place-order-btn" onclick="placeOrder()">
                        Place Order - ₹${currentCart.total.toLocaleString('en-IN')}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addCheckoutModalStyles();
    
    // Close modal events
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Render checkout items
function renderCheckoutItems() {
    return currentCart.items.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>₹${item.price.toLocaleString('en-IN')} × ${item.quantity}</p>
                <small>Size: ${item.selectedSize} | Color: ${item.selectedColor}</small>
            </div>
            <div class="item-total">
                ₹${(item.price * item.quantity).toLocaleString('en-IN')}
            </div>
        </div>
    `).join('');
}

// Render checkout totals
function renderCheckoutTotals() {
    return `
        <div class="total-line">
            <span>Subtotal:</span>
            <span>₹${currentCart.subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div class="total-line">
            <span>Tax (18% GST):</span>
            <span>₹${currentCart.tax.toLocaleString('en-IN')}</span>
        </div>
        <div class="total-line">
            <span>Shipping:</span>
            <span>${currentCart.shipping === 0 ? 'FREE' : '₹' + currentCart.shipping.toLocaleString('en-IN')}</span>
        </div>
        ${currentCart.coupon ? `
            <div class="total-line discount">
                <span>Discount (${currentCart.coupon.code}):</span>
                <span>-₹${currentCart.coupon.discount.toLocaleString('en-IN')}</span>
            </div>
        ` : ''}
        <div class="total-line final-total">
            <span><strong>Total:</strong></span>
            <span><strong>₹${currentCart.total.toLocaleString('en-IN')}</strong></span>
        </div>
    `;
}

// Place order
async function placeOrder() {
    const form = document.getElementById('shippingForm');
    const formData = new FormData(form);
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const shippingAddress = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        pincode: formData.get('pincode')
    };
    
    try {
        // Show loading state
        const placeOrderBtn = document.querySelector('.place-order-btn');
        const originalText = placeOrderBtn.textContent;
        placeOrderBtn.textContent = 'Creating Order...';
        placeOrderBtn.disabled = true;
        
        // Create order
        const orderResponse = await ChandanAPI.createOrder({
            userId: currentUser.id,
            cartId: currentCart.id,
            shippingAddress,
            billingAddress: shippingAddress,
            paymentMethod
        });
        
        const order = orderResponse.data;
        
        if (paymentMethod === 'razorpay') {
            // Initialize Razorpay payment
            initiateRazorpayPayment(order);
        } else {
            // Cash on Delivery
            showOrderConfirmation(order);
            
            // Clear cart
            await ChandanAPI.clearCart(currentUser.id);
            currentCart = { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 };
            updateCartUI();
        }
        
        // Close checkout modal
        const checkoutModal = document.querySelector('.checkout-modal');
        if (checkoutModal) {
            checkoutModal.remove();
        }
        
    } catch (error) {
        console.error('Failed to place order:', error);
        showNotification(error.message || 'Failed to place order', 'error');
        
        // Reset button
        const placeOrderBtn = document.querySelector('.place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.textContent = originalText;
            placeOrderBtn.disabled = false;
        }
    }
}

// Initiate Razorpay payment
function initiateRazorpayPayment(order) {
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => initiateRazorpayPayment(order);
        document.head.appendChild(script);
        return;
    }
    
    const options = {
        key: 'rzp_test_1234567890', // Use your actual Razorpay key ID
        amount: order.pricing.total * 100, // Amount in paise
        currency: 'INR',
        name: 'Chandan Sarees',
        description: 'Purchase from Chandan Sarees',
        order_id: order.razorpayOrderId,
        handler: async function(response) {
            // Payment successful
            try {
                const verificationResponse = await ChandanAPI.verifyPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    orderId: order.id
                });
                
                showOrderConfirmation(verificationResponse.data);
                
                // Clear cart
                await ChandanAPI.clearCart(currentUser.id);
                currentCart = { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 };
                updateCartUI();
                
            } catch (error) {
                console.error('Payment verification failed:', error);
                showNotification('Payment verification failed. Please contact support.', 'error');
            }
        },
        prefill: {
            name: order.addresses.shipping.fullName,
            email: order.addresses.shipping.email,
            contact: order.addresses.shipping.phone
        },
        theme: {
            color: '#8B0000'
        },
        modal: {
            ondismiss: function() {
                showNotification('Payment cancelled', 'error');
            }
        }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
}

// Show order confirmation
function showOrderConfirmation(order) {
    const modal = document.createElement('div');
    modal.className = 'order-confirmation-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content confirmation-content">
            <div class="confirmation-header">
                <div class="success-icon">✓</div>
                <h2>Order Placed Successfully!</h2>
                <p>Thank you for your purchase</p>
            </div>
            <div class="confirmation-body">
                <div class="order-details">
                    <h3>Order Details</h3>
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    <p><strong>Total Amount:</strong> ₹${order.pricing.total.toLocaleString('en-IN')}</p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}</p>
                    <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</p>
                </div>
                <div class="order-actions">
                    <button class="btn-primary" onclick="trackOrder('${order.orderNumber}')">Track Order</button>
                    <button class="btn-secondary" onclick="closeConfirmationModal()">Continue Shopping</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addConfirmationModalStyles();
}

// Track order
async function trackOrder(orderNumber) {
    try {
        const response = await ChandanAPI.trackOrder(orderNumber);
        showTrackingModal(response.data);
    } catch (error) {
        console.error('Failed to track order:', error);
        showNotification('Failed to track order', 'error');
    }
}

// Show tracking modal
function showTrackingModal(trackingInfo) {
    const modal = document.createElement('div');
    modal.className = 'tracking-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content tracking-content">
            <div class="tracking-header">
                <h2>Order Tracking</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="tracking-body">
                <div class="tracking-info">
                    <h3>Order #${trackingInfo.orderNumber}</h3>
                    <p><strong>Status:</strong> ${trackingInfo.status.toUpperCase()}</p>
                    <p><strong>Current Location:</strong> ${trackingInfo.currentLocation}</p>
                    <p><strong>Estimated Delivery:</strong> ${new Date(trackingInfo.estimatedDelivery).toLocaleDateString('en-IN')}</p>
                    ${trackingInfo.trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>` : ''}
                </div>
                <div class="tracking-timeline">
                    <h4>Order Timeline</h4>
                    ${trackingInfo.statusHistory.map(status => `
                        <div class="timeline-item">
                            <div class="timeline-date">${new Date(status.timestamp).toLocaleDateString('en-IN')}</div>
                            <div class="timeline-status">${status.to.toUpperCase()}</div>
                            ${status.notes ? `<div class="timeline-notes">${status.notes}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addTrackingModalStyles();
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Close confirmation modal
function closeConfirmationModal() {
    const modal = document.querySelector('.order-confirmation-modal');
    if (modal) {
        modal.remove();
    }
}

// Add cart modal styles
function addCartModalStyles() {
    if (document.getElementById('cart-modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'cart-modal-styles';
    styles.textContent = `
        .cart-modal .modal-content { max-width: 800px; max-height: 90vh; overflow-y: auto; }
        .cart-modal-header { padding: 1rem 2rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .cart-modal-body { padding: 2rem; }
        .cart-items-list { margin-bottom: 2rem; }
        .cart-item-full { display: flex; align-items: center; padding: 1rem; border: 1px solid #eee; border-radius: 8px; margin-bottom: 1rem; }
        .cart-item-full img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 1rem; }
        .cart-item-details { flex: 1; }
        .cart-item-details h3 { margin-bottom: 0.5rem; color: var(--primary-color); }
        .cart-item-price { font-weight: bold; color: var(--accent-color); }
        .cart-item-options { font-size: 0.9rem; color: var(--text-light); }
        .quantity-controls { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; }
        .quantity-controls button { width: 30px; height: 30px; border: 1px solid #ddd; background: white; cursor: pointer; }
        .quantity-controls input { width: 60px; text-align: center; border: 1px solid #ddd; padding: 0.25rem; }
        .cart-item-total { text-align: right; }
        .cart-item-total p { font-weight: bold; margin-bottom: 0.5rem; }
        .remove-item { background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; }
        .cart-summary { background: #f8f9fa; padding: 1.5rem; border-radius: 8px; }
        .summary-line { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .summary-line.discount { color: green; }
        .summary-line.total { border-top: 2px solid #ddd; padding-top: 0.5rem; margin-top: 1rem; font-size: 1.1rem; }
        .coupon-section { margin: 1rem 0; display: flex; gap: 0.5rem; }
        .coupon-section input { flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
        .coupon-section button { padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer; }
        .cart-actions { display: flex; gap: 1rem; margin-top: 1rem; }
        .cart-actions button { flex: 1; padding: 1rem; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
        .btn-primary { background: var(--primary-color); color: white; }
        .btn-secondary { background: #6c757d; color: white; }
        .empty-cart-message { text-align: center; padding: 2rem; color: var(--text-light); }
        
        /* Cart dropdown styles */
        .cart-container { position: relative; }
        .cart-button { background: none; border: none; font-size: 1.5rem; cursor: pointer; position: relative; color: var(--text-dark); }
        .cart-count { position: absolute; top: -8px; right: -8px; background: var(--accent-color); color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; }
        .cart-dropdown { position: absolute; top: 100%; right: 0; width: 350px; background: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 1000; display: none; }
        .cart-header { padding: 1rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .cart-header h3 { margin: 0; }
        .close-cart { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
        .cart-items { max-height: 300px; overflow-y: auto; padding: 1rem; }
        .cart-item { display: flex; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #eee; }
        .cart-item-image { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 0.5rem; }
        .cart-item-details h4 { margin: 0 0 0.25rem 0; font-size: 0.9rem; }
        .cart-item-details p { margin: 0; font-size: 0.8rem; color: var(--text-light); }
        .cart-footer { padding: 1rem; border-top: 1px solid #eee; }
        .cart-total { margin-bottom: 1rem; text-align: center; }
        .cart-actions { display: flex; gap: 0.5rem; }
        .cart-actions button { flex: 1; padding: 0.5rem; border: none; border-radius: 4px; cursor: pointer; }
        .empty-cart { text-align: center; color: var(--text-light); padding: 2rem; }
    `;
    document.head.appendChild(styles);
}

// Add checkout modal styles
function addCheckoutModalStyles() {
    if (document.getElementById('checkout-modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'checkout-modal-styles';
    styles.textContent = `
        .checkout-modal .modal-content { max-width: 1000px; max-height: 90vh; overflow-y: auto; }
        .checkout-header { padding: 1rem 2rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .checkout-body { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; padding: 2rem; }
        .checkout-form { }
        .shipping-section, .payment-section { margin-bottom: 2rem; }
        .shipping-section h3, .payment-section h3 { color: var(--primary-color); margin-bottom: 1rem; }
        .shipping-section form { display: grid; gap: 1rem; }
        .address-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
        .shipping-section input, .shipping-section textarea { padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; }
        .shipping-section textarea { min-height: 80px; resize: vertical; }
        .payment-options { display: grid; gap: 1rem; }
        .payment-options label { display: flex; align-items: center; gap: 0.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
        .payment-options label:hover { background: #f8f9fa; }
        .payment-options input[type="radio"] { margin: 0; }
        .order-summary { background: #f8f9fa; padding: 1.5rem; border-radius: 8px; height: fit-content; }
        .order-summary h3 { color: var(--primary-color); margin-bottom: 1rem; }
        .checkout-items { margin-bottom: 1.5rem; }
        .checkout-item { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #ddd; }
        .checkout-item img { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; }
        .checkout-item .item-details { flex: 1; }
        .checkout-item h4 { margin: 0 0 0.25rem 0; font-size: 0.9rem; }
        .checkout-item p { margin: 0; font-weight: bold; }
        .checkout-item small { color: var(--text-light); }
        .checkout-totals { margin-bottom: 1.5rem; }
        .total-line { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .total-line.discount { color: green; }
        .total-line.final-total { border-top: 2px solid #ddd; padding-top: 0.5rem; margin-top: 1rem; font-weight: bold; }
        .place-order-btn { width: 100%; padding: 1rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; }
        .place-order-btn:hover { background: var(--accent-color); }
        .place-order-btn:disabled { background: #ccc; cursor: not-allowed; }
        
        @media (max-width: 768px) {
            .checkout-body { grid-template-columns: 1fr; }
            .address-row { grid-template-columns: 1fr; }
        }
    `;
    document.head.appendChild(styles);
}

// Add confirmation modal styles
function addConfirmationModalStyles() {
    if (document.getElementById('confirmation-modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'confirmation-modal-styles';
    styles.textContent = `
        .order-confirmation-modal .modal-content { max-width: 500px; text-align: center; }
        .confirmation-header { padding: 2rem; }
        .success-icon { width: 80px; height: 80px; background: #28a745; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 1rem; }
        .confirmation-header h2 { color: var(--primary-color); margin-bottom: 0.5rem; }
        .confirmation-body { padding: 0 2rem 2rem; }
        .order-details { background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: left; }
        .order-details h3 { color: var(--primary-color); margin-bottom: 1rem; }
        .order-details p { margin-bottom: 0.5rem; }
        .order-actions { display: flex; gap: 1rem; }
        .order-actions button { flex: 1; padding: 1rem; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
    `;
    document.head.appendChild(styles);
}

// Add tracking modal styles
function addTrackingModalStyles() {
    if (document.getElementById('tracking-modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'tracking-modal-styles';
    styles.textContent = `
        .tracking-modal .modal-content { max-width: 600px; }
        .tracking-header { padding: 1rem 2rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .tracking-body { padding: 2rem; }
        .tracking-info { background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; }
        .tracking-info h3 { color: var(--primary-color); margin-bottom: 1rem; }
        .tracking-info p { margin-bottom: 0.5rem; }
        .tracking-timeline h4 { color: var(--primary-color); margin-bottom: 1rem; }
        .timeline-item { padding: 1rem; border-left: 3px solid var(--primary-color); margin-left: 1rem; margin-bottom: 1rem; background: #f8f9fa; }
        .timeline-date { font-weight: bold; color: var(--text-dark); }
        .timeline-status { color: var(--primary-color); font-weight: bold; margin: 0.25rem 0; }
        .timeline-notes { color: var(--text-light); font-size: 0.9rem; }
    `;
    document.head.appendChild(styles);
}

// Export API for external use
window.ChandanAPI = ChandanAPI;