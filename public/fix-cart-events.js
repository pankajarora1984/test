// Fix for cart functionality - remove inline onclick handlers and use proper event delegation

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Use event delegation for dynamically created cart elements
    document.addEventListener('click', function(e) {
        
        // Handle quantity decrease buttons
        if ((e.target.classList.contains('qty-decrease') || e.target.textContent === '-') && e.target.closest('.quantity-controls')) {
            e.preventDefault();
            const itemContainer = e.target.closest('.cart-item, .cart-item-full');
            const itemId = getItemIdFromContainer(itemContainer);
            
            // Get current quantity from span or input
            const quantityElement = e.target.nextElementSibling;
            const currentQty = quantityElement.classList.contains('quantity-input') ? 
                parseInt(quantityElement.value) : parseInt(quantityElement.textContent);
            
            if (currentQty > 1) {
                updateCartItemQuantity(itemId, currentQty - 1);
            }
        }
        
        // Handle quantity increase buttons
        if ((e.target.classList.contains('qty-increase') || e.target.textContent === '+') && e.target.closest('.quantity-controls')) {
            e.preventDefault();
            const itemContainer = e.target.closest('.cart-item, .cart-item-full');
            const itemId = getItemIdFromContainer(itemContainer);
            
            // Get current quantity from span or input
            const quantityElement = e.target.previousElementSibling;
            const currentQty = quantityElement.classList.contains('quantity-input') ? 
                parseInt(quantityElement.value) : parseInt(quantityElement.textContent);
            
            updateCartItemQuantity(itemId, currentQty + 1);
        }
        
        // Handle remove item buttons
        if (e.target.classList.contains('remove-item') || e.target.textContent === '×') {
            e.preventDefault();
            const itemContainer = e.target.closest('.cart-item');
            const itemId = getItemIdFromContainer(itemContainer);
            if (itemId) {
                removeFromCart(itemId);
            }
        }
        
        // Handle Apply Coupon button
        if (e.target.classList.contains('apply-coupon-btn') || (e.target.textContent === 'Apply' && e.target.closest('.coupon-section'))) {
            e.preventDefault();
            applyCoupon();
        }
        
        // Handle Clear Cart button
        if (e.target.classList.contains('clear-cart-btn') || e.target.textContent === 'Clear Cart') {
            e.preventDefault();
            clearCart();
        }
        
        // Handle Proceed to Checkout button
        if (e.target.classList.contains('proceed-checkout-btn') || e.target.textContent === 'Proceed to Checkout') {
            e.preventDefault();
            proceedToCheckout();
        }
        
        // Handle Place Order button
        if (e.target.classList.contains('place-order-btn')) {
            e.preventDefault();
            placeOrder();
        }
        
        // Handle Track Order buttons
        if (e.target.textContent === 'Track Order') {
            e.preventDefault();
            const orderNumber = e.target.getAttribute('data-order-number');
            if (orderNumber) {
                trackOrder(orderNumber);
            }
        }
        
        // Handle Continue Shopping button
        if (e.target.textContent === 'Continue Shopping') {
            e.preventDefault();
            closeConfirmationModal();
        }
        
        // Handle Try Again button
        if (e.target.classList.contains('retry-button')) {
            e.preventDefault();
            location.reload();
        }
        
    });
    
    // Handle quantity input changes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            e.preventDefault();
            const itemId = e.target.getAttribute('data-item-id') || getItemIdFromContainer(e.target.closest('.cart-item, .cart-item-full'));
            const newQty = parseInt(e.target.value);
            if (newQty > 0 && itemId) {
                updateCartItemQuantity(itemId, newQty);
            }
        }
    });
    
    // Helper function to extract item ID from cart item container
    function getItemIdFromContainer(container) {
        if (!container) return null;
        
        // Try to find item ID from various possible sources
        const itemId = container.getAttribute('data-item-id') || 
                      container.querySelector('[data-item-id]')?.getAttribute('data-item-id');
        
        if (itemId) return itemId;
        
        // Fallback: try to extract from button onclick attribute if it exists
        const buttons = container.querySelectorAll('button');
        for (let button of buttons) {
            const onclick = button.getAttribute('onclick');
            if (onclick && onclick.includes("'")) {
                const match = onclick.match(/'([^']+)'/);
                if (match) return match[1];
            }
        }
        
        return null;
    }
    
});

console.log('Cart event delegation script loaded');