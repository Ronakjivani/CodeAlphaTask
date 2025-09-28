// Global variables
let products = [];
let cart = [];
let orders = [];

// DOM elements
const productsGrid = document.getElementById('products-grid');
const cartModal = document.getElementById('cart-modal');
const checkoutModal = document.getElementById('checkout-modal');
const adminModal = document.getElementById('admin-modal');
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    loadCartFromStorage();
    updateCartUI();
});

// Event Listeners
function setupEventListeners() {
    // Cart modal
    cartBtn.addEventListener('click', () => showModal(cartModal));
    document.getElementById('close-cart').addEventListener('click', () => hideModal(cartModal));
    document.getElementById('clear-cart').addEventListener('click', clearCart);
    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            showMessage('Your cart is empty!', 'error');
            return;
        }
        hideModal(cartModal);
        showCheckoutModal();
    });

    // Checkout modal
    document.getElementById('close-checkout').addEventListener('click', () => hideModal(checkoutModal));
    document.getElementById('cancel-checkout').addEventListener('click', () => hideModal(checkoutModal));
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);

    // Admin modal
    document.getElementById('admin-btn').addEventListener('click', () => {
        showModal(adminModal);
        loadOrders();
    });
    document.getElementById('close-admin').addEventListener('click', () => hideModal(adminModal));
    document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);

    // Admin tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });

    // Filters
    document.getElementById('category-filter').addEventListener('change', filterProducts);
    document.getElementById('search-input').addEventListener('input', filterProducts);

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target);
        }
    });
}

// API Functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`/api${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        showMessage(error.message, 'error');
        throw error;
    }
}

// Product Functions
async function loadProducts() {
    try {
        products = await apiCall('/products');
        displayProducts(products);
    } catch (error) {
        productsGrid.innerHTML = '<div class="loading">Failed to load products</div>';
    }
}

function displayProducts(productList) {
    if (productList.length === 0) {
        productsGrid.innerHTML = '<div class="loading">No products found</div>';
        return;
    }

    productsGrid.innerHTML = productList.map(product => `
        <div class="product-card" data-category="${product.category || ''}">
            <div class="product-image">
                ${product.image_url ? 
                    `<img src="${product.image_url}" alt="${product.name}" onerror="this.parentElement.innerHTML='<i class=\\"fas fa-image\\"></i>` : 
                    '<i class="fas fa-image"></i>'
                }
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-stock ${product.stock <= 0 ? 'stock-out' : product.stock <= 5 ? 'stock-low' : ''}">
                    ${product.stock <= 0 ? 'Out of Stock' : `Stock: ${product.stock}`}
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id})" 
                        ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const category = document.getElementById('category-filter').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    const filtered = products.filter(product => {
        const matchesCategory = !category || product.category === category;
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm));
        
        return matchesCategory && matchesSearch;
    });

    displayProducts(filtered);
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock <= 0) {
        showMessage('Product is out of stock!', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            showMessage('Cannot add more items than available stock!', 'error');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: 1,
            stock: product.stock
        });
    }

    saveCartToStorage();
    updateCartUI();
    showMessage(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
    updateCartModal();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    if (newQuantity > item.stock) {
        showMessage('Cannot add more items than available stock!', 'error');
        return;
    }

    item.quantity = newQuantity;
    saveCartToStorage();
    updateCartUI();
    updateCartModal();
}

function clearCart() {
    cart = [];
    saveCartToStorage();
    updateCartUI();
    updateCartModal();
    showMessage('Cart cleared!', 'success');
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function updateCartModal() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartTotal.textContent = '0.00';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

// Checkout Functions
function showCheckoutModal() {
    updateCheckoutModal();
    showModal(checkoutModal);
}

function updateCheckoutModal() {
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');

    checkoutItems.innerHTML = cart.map(item => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>${item.name} x ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotal.textContent = total.toFixed(2);
}

async function handleCheckout(e) {
    e.preventDefault();

    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;
    const customerPhone = document.getElementById('customer-phone').value;

    if (!customerName || !customerEmail) {
        showMessage('Please fill in all required fields!', 'error');
        return;
    }

    const orderData = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity
        }))
    };

    try {
        await apiCall('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        clearCart();
        hideModal(checkoutModal);
        showMessage('Order placed successfully!', 'success');
        
        // Reset form
        document.getElementById('checkout-form').reset();
        
        // Reload products to update stock
        loadProducts();
    } catch (error) {
        // Error is already handled in apiCall
    }
}

// Admin Functions
async function handleAddProduct(e) {
    e.preventDefault();

    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        image_url: document.getElementById('product-image').value,
        stock: parseInt(document.getElementById('product-stock').value) || 0,
        category: document.getElementById('product-category').value
    };

    try {
        await apiCall('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });

        showMessage('Product added successfully!', 'success');
        document.getElementById('add-product-form').reset();
        loadProducts();
    } catch (error) {
        // Error is already handled in apiCall
    }
}

async function loadOrders() {
    try {
        orders = await apiCall('/orders');
        displayOrders();
    } catch (error) {
        document.getElementById('orders-list').innerHTML = '<div class="loading">Failed to load orders</div>';
    }
}

function displayOrders() {
    const ordersList = document.getElementById('orders-list');

    if (orders.length === 0) {
        ordersList.innerHTML = '<div class="loading">No orders found</div>';
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <span class="order-id">Order #${order.id}</span>
                <span class="order-status">${order.status}</span>
            </div>
            <div class="order-details">
                <strong>Customer:</strong> ${order.customer_name} (${order.customer_email})<br>
                <strong>Total:</strong> $${order.total_amount.toFixed(2)}<br>
                <strong>Items:</strong> ${order.items || 'N/A'}<br>
                <strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}
            </div>
        </div>
    `).join('');
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Load data if needed
    if (tabName === 'view-orders') {
        loadOrders();
    }
}

// Modal Functions
function showModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    if (modal === cartModal) {
        updateCartModal();
    }
}

function hideModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Storage Functions
function saveCartToStorage() {
    localStorage.setItem('ecommerce-cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('ecommerce-cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

// Message Functions
function showMessage(text, type) {
    const message = type === 'error' ? errorMessage : successMessage;
    const textElement = message.querySelector('span');
    
    textElement.textContent = text;
    message.classList.add('show');
    
    setTimeout(() => {
        message.classList.remove('show');
    }, 3000);
}

// Utility Functions
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}
