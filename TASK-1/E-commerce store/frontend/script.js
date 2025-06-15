// Global variables
let allProducts = [];
const API_URL = 'http://localhost:5000/api';

// DOM Elements
const productList = document.getElementById('product-list');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const cartCount = document.getElementById('cart-count');
const productModal = document.getElementById('product-modal');
const productDetails = document.getElementById('product-details');
const closeModal = document.querySelector('.close-modal');

// Initialize the application
async function init() {
    try {
        await fetchProducts();
        updateCartCount();
        setupEventListeners();
    } catch (err) {
        showError('Failed to initialize the application');
    }
}

// Fetch products from the API
async function fetchProducts() {
    try {
        loading.style.display = 'block';
        error.style.display = 'none';
        
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        allProducts = await response.json();
        displayProducts(allProducts);
    } catch (err) {
        showError('Failed to load products. Please try again later.');
    } finally {
        loading.style.display = 'none';
    }
}

// Display products in the grid
function displayProducts(products) {
    productList.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image || 'https://via.placeholder.com/200'}" 
                 alt="${product.name}" 
                 class="product-image"
                 onclick="showProductDetails('${product._id}')">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price"><span>&#8377;</span>${product.price.toFixed(2)}</p>
                <button class="add-to-cart" onclick="addToCart('${product._id}')">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Show product details in modal
function showProductDetails(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;

    productDetails.innerHTML = `
        <div class="product-detail">
            <img src="${product.image || 'https://via.placeholder.com/400'}" 
                 alt="${product.name}" 
                 class="product-detail-image">
            <div class="product-detail-info">
                <h2>${product.name}</h2>
                <p class="product-detail-price">$${product.price.toFixed(2)}</p>
                <p class="product-detail-description">${product.description || 'No description available.'}</p>
                <div class="quantity-selector">
                    <button onclick="updateQuantity('${product._id}', -1)">-</button>
                    <span id="quantity-${product._id}">1</span>
                    <button onclick="updateQuantity('${product._id}', 1)">+</button>
                </div>
                <button class="add-to-cart" onclick="addToCart('${product._id}', true)">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    productModal.style.display = 'block';
}

// Update quantity in product details
function updateQuantity(productId, change) {
    const quantityElement = document.getElementById(`quantity-${productId}`);
    let quantity = parseInt(quantityElement.textContent) + change;
    quantity = Math.max(1, Math.min(quantity, 10)); // Limit between 1 and 10
    quantityElement.textContent = quantity;
}

// Add to cart functionality
function addToCart(productId, fromModal = false) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const quantity = fromModal ? 
        parseInt(document.getElementById(`quantity-${productId}`).textContent) : 1;
    
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ productId, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    if (fromModal) {
        productModal.style.display = 'none';
    }
    
    showNotification('Added to cart!');
}

// Update cart count in navigation
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Search functionality
function searchProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
        displayProducts(allProducts);
        return;
    }

    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
    );
    
    displayProducts(filteredProducts);
}

// Show error message
function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Setup event listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', searchProducts);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchProducts();
    });
    
    closeModal.addEventListener('click', () => {
        productModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.style.display = 'none';
        }
    });
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Admin Panel Functions
function showTab(tabName) {
    const productsSection = document.getElementById('products-section');
    const ordersSection = document.getElementById('orders-section');
    const tabs = document.querySelectorAll('.admin-tab');

    tabs.forEach(tab => {
        if (tab.textContent.toLowerCase().includes(tabName)) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    if (tabName === 'products') {
        productsSection.style.display = 'block';
        ordersSection.style.display = 'none';
    } else if (tabName === 'orders') {
        productsSection.style.display = 'none';
        ordersSection.style.display = 'block';
        loadOrders(); // Load orders when switching to orders tab
    }
}

// Load and display orders
async function loadOrders() {
    try {
        const response = await fetch('http://localhost:3000/api/orders');
        const orders = await response.json();
        const ordersTableBody = document.getElementById('orders-table-body');
        ordersTableBody.innerHTML = '';

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order._id}</td>
                <td>
                    <div>${order.customer.name}</div>
                    <div>${order.customer.email}</div>
                </td>
                <td>${order.items.map(item => `${item.quantity}x ${item.productId.name}`).join('<br>')}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td>
                    <select class="order-status" data-order-id="${order._id}" onchange="updateOrderStatus(this)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="viewOrderDetails('${order._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        alert('Failed to load orders. Please try again.');
    }
}

// Update order status
async function updateOrderStatus(selectElement) {
    const orderId = selectElement.dataset.orderId;
    const newStatus = selectElement.value;

    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            throw new Error('Failed to update order status');
        }

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Order status updated successfully';
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to update order status. Please try again.');
        // Reset the select element to its previous value
        selectElement.value = selectElement.dataset.previousValue;
    }
}

// View order details
function viewOrderDetails(orderId) {
    // Implement order details view functionality
    // This could open a modal or navigate to a details page
    alert('Order details view functionality to be implemented');
}

// Add event listeners for order search and filter
document.addEventListener('DOMContentLoaded', function() {
    const orderSearch = document.getElementById('order-search');
    const orderStatusFilter = document.getElementById('order-status-filter');

    if (orderSearch) {
        orderSearch.addEventListener('input', filterOrders);
    }
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', filterOrders);
    }
});

// Filter orders based on search and status
function filterOrders() {
    const searchTerm = document.getElementById('order-search').value.toLowerCase();
    const statusFilter = document.getElementById('order-status-filter').value;
    const rows = document.querySelectorAll('#orders-table-body tr');

    rows.forEach(row => {
        const orderId = row.cells[0].textContent.toLowerCase();
        const customerName = row.cells[1].textContent.toLowerCase();
        const status = row.cells[4].querySelector('select').value;

        const matchesSearch = orderId.includes(searchTerm) || customerName.includes(searchTerm);
        const matchesStatus = !statusFilter || status === statusFilter;

        row.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
}
