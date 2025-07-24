// AI Recommendation System Frontend
class AIRecommendations {
    constructor() {
        this.userId = currentUser?.id || 'guest_' + Date.now();
        this.recommendations = [];
        this.userPreferences = {};
        this.isLoading = false;
    }

    // Get AI recommendations
    async getRecommendations(preferences = {}, currentProduct = null, context = 'general') {
        this.isLoading = true;
        try {
            const response = await fetch('/api/recommendations/suggest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.userId,
                    preferences,
                    currentProduct,
                    context
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.recommendations = data.recommendations || [];
                logger.api('AI recommendations received', 'GET', 200, 0, { 
                    count: this.recommendations.length, 
                    provider: data.provider 
                });
                return data;
            } else {
                throw new Error(data.message || 'Failed to get recommendations');
            }
        } catch (error) {
            logger.api('AI recommendations failed', 'GET', 500, 0, {}, error.message);
            console.error('AI Recommendations Error:', error);
            return { success: false, recommendations: [], error: error.message };
        } finally {
            this.isLoading = false;
        }
    }

    // Track user interaction
    async trackInteraction(action, productId) {
        try {
            await fetch('/api/recommendations/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.userId,
                    action,
                    productId
                })
            });
        } catch (error) {
            console.warn('Failed to track interaction:', error);
        }
    }

    // Update user preferences
    async updatePreferences(preferences) {
        try {
            const response = await fetch(`/api/recommendations/preferences/${this.userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ preferences })
            });

            if (response.ok) {
                this.userPreferences = { ...this.userPreferences, ...preferences };
            }
        } catch (error) {
            console.warn('Failed to update preferences:', error);
        }
    }

    // Show AI recommendation modal
    async showRecommendationModal(preferences = {}, context = 'general') {
        // Show loading indicator
        this.showLoadingModal();

        try {
            const result = await this.getRecommendations(preferences, null, context);
            
            if (result.success && result.recommendations.length > 0) {
                this.displayRecommendationModal(result);
            } else {
                this.showNoRecommendationsModal();
            }
        } catch (error) {
            this.showErrorModal(error.message);
        }
    }

    // Display recommendation modal
    displayRecommendationModal(data) {
        const modal = document.createElement('div');
        modal.className = 'ai-recommendation-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content ai-modal-content">
                <div class="ai-modal-header">
                    <div class="ai-header-content">
                        <h2>🤖 AI Recommendations</h2>
                        <p class="ai-explanation">${data.explanation}</p>
                        <span class="ai-provider">Powered by ${data.provider === 'local' ? 'Smart Algorithm' : data.provider.toUpperCase()}</span>
                    </div>
                    <button class="modal-close" onclick="this.closest('.ai-recommendation-modal').remove()">&times;</button>
                </div>
                <div class="ai-modal-body">
                    <div class="recommendations-grid">
                        ${this.renderRecommendations(data.recommendations)}
                    </div>
                    ${this.renderPreferencesForm()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.addAIModalStyles();

        // Close modal events
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Track recommendation display
        this.trackInteraction('recommendation_shown', 'modal');
    }

    // Render individual recommendations
    renderRecommendations(recommendations) {
        return recommendations.map(rec => `
            <div class="recommendation-card" data-product-id="${rec.product.id}">
                <div class="rec-image">
                    ${rec.product.images && rec.product.images.length > 0 ? 
                        `<img src="${rec.product.images[0]}" alt="${rec.product.name}">` :
                        `<div class="placeholder-image"><i class="fas fa-image"></i></div>`
                    }
                    <div class="ai-score">
                        <i class="fas fa-robot"></i>
                        ${Math.round(rec.score * 100)}%
                    </div>
                </div>
                <div class="rec-content">
                    <h3>${rec.product.name}</h3>
                    <p class="rec-price">₹${rec.product.price.toLocaleString('en-IN')}</p>
                    <p class="rec-reason">${rec.reason}</p>
                    <div class="rec-actions">
                        <button class="btn-secondary view-product-btn" data-product-id="${rec.product.id}">
                            View Details
                        </button>
                        <button class="btn-primary add-to-cart-btn" data-product-id="${rec.product.id}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render preferences form
    renderPreferencesForm() {
        return `
            <div class="preferences-section">
                <h3>🎯 Refine Your Preferences</h3>
                <p>Help us provide better recommendations by updating your preferences:</p>
                <form class="preferences-form">
                    <div class="pref-row">
                        <div class="pref-field">
                            <label>Occasion:</label>
                            <select name="occasion">
                                <option value="">Any</option>
                                <option value="wedding">Wedding</option>
                                <option value="festival">Festival</option>
                                <option value="party">Party</option>
                                <option value="office">Office</option>
                                <option value="casual">Casual</option>
                                <option value="formal">Formal</option>
                            </select>
                        </div>
                        <div class="pref-field">
                            <label>Price Range:</label>
                            <select name="priceRange">
                                <option value="">Any</option>
                                <option value="budget">Budget (Under ₹5,000)</option>
                                <option value="moderate">Moderate (₹5,000 - ₹15,000)</option>
                                <option value="premium">Premium (Above ₹15,000)</option>
                            </select>
                        </div>
                    </div>
                    <div class="pref-row">
                        <div class="pref-field">
                            <label>Material:</label>
                            <select name="material">
                                <option value="">Any</option>
                                <option value="silk">Silk</option>
                                <option value="cotton">Cotton</option>
                                <option value="georgette">Georgette</option>
                                <option value="chiffon">Chiffon</option>
                                <option value="net">Net</option>
                                <option value="velvet">Velvet</option>
                            </select>
                        </div>
                        <div class="pref-field">
                            <label>Style:</label>
                            <select name="style">
                                <option value="">Any</option>
                                <option value="traditional">Traditional</option>
                                <option value="modern">Modern</option>
                                <option value="designer">Designer</option>
                                <option value="ethnic">Ethnic</option>
                            </select>
                        </div>
                    </div>
                    <div class="pref-actions">
                        <button type="button" class="btn-primary get-new-recommendations">
                            Get New Recommendations
                        </button>
                        <button type="button" class="btn-secondary save-preferences">
                            Save Preferences
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    // Show loading modal
    showLoadingModal() {
        const modal = document.createElement('div');
        modal.className = 'ai-recommendation-modal loading-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content ai-modal-content loading-content">
                <div class="loading-animation">
                    <div class="ai-robot">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="loading-text">
                        <h3>🤖 AI is analyzing your preferences...</h3>
                        <p>Finding the perfect products for you</p>
                        <div class="loading-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.addAIModalStyles();
    }

    // Show no recommendations modal
    showNoRecommendationsModal() {
        // Remove loading modal
        const loadingModal = document.querySelector('.loading-modal');
        if (loadingModal) loadingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'ai-recommendation-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content ai-modal-content">
                <div class="ai-modal-header">
                    <h2>🤖 AI Recommendations</h2>
                    <button class="modal-close" onclick="this.closest('.ai-recommendation-modal').remove()">&times;</button>
                </div>
                <div class="ai-modal-body">
                    <div class="no-recommendations">
                        <i class="fas fa-search"></i>
                        <h3>No specific recommendations found</h3>
                        <p>Try adjusting your preferences or browse our featured products.</p>
                        <button class="btn-primary" onclick="this.closest('.ai-recommendation-modal').remove(); window.location.href='#collections'">
                            Browse Products
                        </button>
                    </div>
                    ${this.renderPreferencesForm()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.addAIModalStyles();
    }

    // Show error modal
    showErrorModal(errorMessage) {
        // Remove loading modal
        const loadingModal = document.querySelector('.loading-modal');
        if (loadingModal) loadingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'ai-recommendation-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content ai-modal-content">
                <div class="ai-modal-header">
                    <h2>🤖 AI Recommendations</h2>
                    <button class="modal-close" onclick="this.closest('.ai-recommendation-modal').remove()">&times;</button>
                </div>
                <div class="ai-modal-body">
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Something went wrong</h3>
                        <p>${errorMessage}</p>
                        <button class="btn-primary" onclick="this.closest('.ai-recommendation-modal').remove()">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.addAIModalStyles();
    }

    // Add AI modal styles
    addAIModalStyles() {
        if (document.getElementById('ai-modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ai-modal-styles';
        styles.textContent = `
            .ai-recommendation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .ai-recommendation-modal .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                z-index: 1;
            }
            
            .ai-modal-content {
                position: relative;
                z-index: 2;
                max-width: 1000px;
                max-height: 90vh;
                width: 95%;
                overflow-y: auto;
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .ai-modal-header {
                padding: 1.5rem 2rem;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                background: linear-gradient(135deg, #8B0000, #A0522D);
                color: white;
                border-radius: 16px 16px 0 0;
            }
            
            .ai-header-content h2 {
                margin: 0 0 0.5rem 0;
                font-size: 1.5rem;
            }
            
            .ai-explanation {
                margin: 0 0 0.5rem 0;
                opacity: 0.9;
                font-size: 0.95rem;
            }
            
            .ai-provider {
                font-size: 0.8rem;
                background: rgba(255, 255, 255, 0.2);
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
            }
            
            .modal-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            }
            
            .modal-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .ai-modal-body {
                padding: 2rem;
            }
            
            .recommendations-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .recommendation-card {
                border: 1px solid #eee;
                border-radius: 12px;
                overflow: hidden;
                transition: transform 0.2s, box-shadow 0.2s;
                background: white;
            }
            
            .recommendation-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            }
            
            .rec-image {
                position: relative;
                height: 200px;
                background: #f8f9fa;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .rec-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .placeholder-image {
                color: #ccc;
                font-size: 3rem;
            }
            
            .ai-score {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: linear-gradient(135deg, #8B0000, #A0522D);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }
            
            .rec-content {
                padding: 1rem;
            }
            
            .rec-content h3 {
                margin: 0 0 0.5rem 0;
                color: var(--primary-color);
                font-size: 1.1rem;
            }
            
            .rec-price {
                font-weight: bold;
                color: var(--accent-color);
                font-size: 1.1rem;
                margin-bottom: 0.5rem;
            }
            
            .rec-reason {
                color: var(--text-light);
                font-size: 0.9rem;
                margin-bottom: 1rem;
                font-style: italic;
            }
            
            .rec-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .rec-actions button {
                flex: 1;
                padding: 0.75rem;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.2s;
            }
            
            .preferences-section {
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 12px;
                border: 1px solid #eee;
            }
            
            .preferences-section h3 {
                margin: 0 0 0.5rem 0;
                color: var(--primary-color);
            }
            
            .preferences-section p {
                color: var(--text-light);
                margin-bottom: 1rem;
            }
            
            .pref-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .pref-field label {
                display: block;
                margin-bottom: 0.25rem;
                font-weight: bold;
                color: var(--text-dark);
            }
            
            .pref-field select {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 0.9rem;
            }
            
            .pref-actions {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
            }
            
            .pref-actions button {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.2s;
            }
            
            /* Loading styles */
            .loading-content {
                text-align: center;
                padding: 3rem 2rem;
            }
            
            .ai-robot {
                font-size: 4rem;
                color: var(--primary-color);
                margin-bottom: 1rem;
                animation: robotPulse 2s infinite;
            }
            
            @keyframes robotPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .loading-text h3 {
                margin-bottom: 0.5rem;
                color: var(--primary-color);
            }
            
            .loading-dots {
                display: flex;
                justify-content: center;
                gap: 0.5rem;
                margin-top: 1rem;
            }
            
            .loading-dots span {
                width: 8px;
                height: 8px;
                background: var(--primary-color);
                border-radius: 50%;
                animation: loadingDots 1.4s infinite ease-in-out;
            }
            
            .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
            .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
            
            @keyframes loadingDots {
                0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
                40% { transform: scale(1); opacity: 1; }
            }
            
            /* Error and no recommendations styles */
            .no-recommendations, .error-message {
                text-align: center;
                padding: 2rem;
                color: var(--text-light);
            }
            
            .no-recommendations i, .error-message i {
                font-size: 3rem;
                margin-bottom: 1rem;
                color: var(--text-light);
            }
            
            .error-message i {
                color: #dc3545;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .ai-modal-content {
                    width: 95%;
                    margin: 1rem;
                }
                
                .recommendations-grid {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
                
                .pref-row {
                    grid-template-columns: 1fr;
                }
                
                .pref-actions {
                    flex-direction: column;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // Add AI recommendation button to the page
    addAIRecommendationButton() {
        // Add to navigation
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && !document.querySelector('.ai-rec-nav-btn')) {
            const aiNavItem = document.createElement('li');
            aiNavItem.innerHTML = '<button class="ai-rec-nav-btn" id="ai-nav-btn">🤖 AI Recommendations</button>';
            navMenu.appendChild(aiNavItem);
            
            // Add event listener for navigation button
            const navBtn = document.getElementById('ai-nav-btn');
            if (navBtn) {
                navBtn.addEventListener('click', () => {
                    this.showRecommendationModal();
                });
            }
        }

        // Add floating AI button
        if (!document.querySelector('.floating-ai-btn')) {
            const floatingBtn = document.createElement('div');
            floatingBtn.className = 'floating-ai-btn';
            floatingBtn.innerHTML = `
                <button id="floating-ai-btn" title="Get AI Recommendations" type="button">
                    🤖
                </button>
            `;
            document.body.appendChild(floatingBtn);
            
            // Add event listener for floating button
            const floatingButton = document.getElementById('floating-ai-btn');
            if (floatingButton) {
                floatingButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('AI button clicked!'); // Debug log
                    this.showRecommendationModal();
                });
            }
        }

        // Add styles for the buttons
        this.addButtonStyles();
    }

    addButtonStyles() {
        if (document.getElementById('ai-button-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ai-button-styles';
        styles.textContent = `
            .ai-rec-nav-btn {
                background: linear-gradient(135deg, #8B0000, #A0522D);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
                font-size: 0.9rem;
            }
            
            .ai-rec-nav-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(139, 0, 0, 0.3);
            }
            
            .floating-ai-btn {
                position: fixed;
                bottom: 80px;
                right: 20px;
                z-index: 10002;
                pointer-events: all;
            }
            
            .floating-ai-btn button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: none;
                background: linear-gradient(135deg, #8B0000, #A0522D);
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(139, 0, 0, 0.3);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: all;
                position: relative;
                z-index: 1;
            }
            
            .floating-ai-btn button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(139, 0, 0, 0.4);
            }
            
            .floating-ai-btn button:active {
                transform: scale(0.95);
            }
            
            /* Add pulse animation to make it more noticeable */
            .floating-ai-btn button::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                border-radius: 50%;
                background: linear-gradient(135deg, #8B0000, #A0522D);
                opacity: 0.7;
                z-index: -1;
                animation: aiPulse 2s infinite;
            }
            
            @keyframes aiPulse {
                0% { transform: scale(1); opacity: 0.7; }
                50% { transform: scale(1.1); opacity: 0.3; }
                100% { transform: scale(1); opacity: 0.7; }
            }
            
            @media (max-width: 768px) {
                .floating-ai-btn {
                    bottom: 20px;
                    right: 20px;
                }
                
                .floating-ai-btn button {
                    width: 50px;
                    height: 50px;
                    font-size: 1.2rem;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialize AI recommendations
const aiRecommendations = new AIRecommendations();

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load, then add AI recommendation buttons
    setTimeout(() => {
        console.log('🤖 Initializing AI Recommendation System...');
        aiRecommendations.addAIRecommendationButton();
        console.log('🤖 AI Recommendation buttons added');
        
        // Debug: Check if buttons exist
        const floatingBtn = document.getElementById('floating-ai-btn');
        const navBtn = document.getElementById('ai-nav-btn');
        console.log('Floating button found:', !!floatingBtn);
        console.log('Nav button found:', !!navBtn);
        
        // Double-check event listeners after a delay
        setTimeout(() => {
            const floatingButton = document.getElementById('floating-ai-btn');
            if (floatingButton && !floatingButton.hasAttribute('data-listener-added')) {
                console.log('🔧 Re-adding floating button event listener');
                floatingButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('AI floating button clicked!');
                    aiRecommendations.showRecommendationModal();
                });
                floatingButton.setAttribute('data-listener-added', 'true');
            }
        }, 1000);
    }, 500);

         // Add event delegation for recommendation actions
     document.addEventListener('click', async (e) => {
         // Handle floating AI button click as fallback
         if (e.target.id === 'floating-ai-btn' || e.target.closest('#floating-ai-btn')) {
             e.preventDefault();
             e.stopPropagation();
             console.log('🤖 AI button clicked via delegation');
             await aiRecommendations.showRecommendationModal();
             return;
         }
         
         // Handle nav AI button click as fallback
         if (e.target.id === 'ai-nav-btn' || e.target.closest('#ai-nav-btn')) {
             e.preventDefault();
             e.stopPropagation();
             console.log('🤖 AI nav button clicked via delegation');
             await aiRecommendations.showRecommendationModal();
             return;
         }
         
         // Handle view product button in recommendations
         if (e.target.classList.contains('view-product-btn')) {
             const productId = e.target.getAttribute('data-product-id');
             await aiRecommendations.trackInteraction('click', productId);
             viewProductDetails(productId);
         }

        // Handle add to cart button in recommendations
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = e.target.getAttribute('data-product-id');
            await aiRecommendations.trackInteraction('add_to_cart', productId);
            await addToCart(productId);
        }

        // Handle get new recommendations button
        if (e.target.classList.contains('get-new-recommendations')) {
            const form = e.target.closest('.preferences-form');
            const formData = new FormData(form);
            const preferences = Object.fromEntries(formData.entries());
            
            // Filter out empty values
            Object.keys(preferences).forEach(key => {
                if (!preferences[key]) delete preferences[key];
            });

            // Close current modal
            const modal = e.target.closest('.ai-recommendation-modal');
            if (modal) modal.remove();

            // Show new recommendations
            await aiRecommendations.showRecommendationModal(preferences, 'preference_update');
        }

        // Handle save preferences button
        if (e.target.classList.contains('save-preferences')) {
            const form = e.target.closest('.preferences-form');
            const formData = new FormData(form);
            const preferences = Object.fromEntries(formData.entries());
            
            // Filter out empty values
            Object.keys(preferences).forEach(key => {
                if (!preferences[key]) delete preferences[key];
            });

            await aiRecommendations.updatePreferences(preferences);
            
            // Show success message
            e.target.textContent = 'Saved!';
            e.target.style.background = 'green';
            setTimeout(() => {
                e.target.textContent = 'Save Preferences';
                e.target.style.background = '';
            }, 2000);
        }
    });
});

// Integrate with existing product view function
const originalViewProductDetails = window.viewProductDetails;
window.viewProductDetails = async function(productId) {
    // Track product view
    await aiRecommendations.trackInteraction('view', productId);
    
    // Call original function
    if (originalViewProductDetails) {
        originalViewProductDetails(productId);
    }
    
    // Show related recommendations after a delay
    setTimeout(async () => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const recommendations = await aiRecommendations.getRecommendations({}, product, 'product-view');
            if (recommendations.success && recommendations.recommendations.length > 0) {
                // Add recommendations section to product modal
                addRecommendationsToProductModal(recommendations.recommendations);
            }
        }
    }, 1000);
};

// Add recommendations to product modal
function addRecommendationsToProductModal(recommendations) {
    const productModal = document.querySelector('.product-modal');
    if (!productModal || document.querySelector('.product-recommendations')) return;

    const recommendationsHtml = `
        <div class="product-recommendations">
            <h3>🤖 You might also like</h3>
            <div class="mini-recommendations">
                ${recommendations.slice(0, 3).map(rec => `
                    <div class="mini-rec-card" data-product-id="${rec.product.id}">
                        <div class="mini-rec-image">
                            ${rec.product.images && rec.product.images.length > 0 ? 
                                `<img src="${rec.product.images[0]}" alt="${rec.product.name}">` :
                                `<div class="placeholder-image"><i class="fas fa-image"></i></div>`
                            }
                        </div>
                        <div class="mini-rec-content">
                            <h4>${rec.product.name}</h4>
                            <p>₹${rec.product.price.toLocaleString('en-IN')}</p>
                            <button class="mini-view-btn" data-product-id="${rec.product.id}">View</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    const modalBody = productModal.querySelector('.modal-body');
    if (modalBody) {
        modalBody.insertAdjacentHTML('beforeend', recommendationsHtml);
    }
}

console.log('🤖 AI Recommendations System Loaded');

// Global function to test AI recommendations (for debugging)
window.testAI = function() {
    console.log('🧪 Testing AI Recommendations...');
    if (window.aiRecommendations) {
        aiRecommendations.showRecommendationModal();
    } else {
        console.error('❌ aiRecommendations not found');
    }
};

// Make aiRecommendations globally accessible for debugging
window.aiRecommendations = aiRecommendations;