const sqlite3 = require('sqlite3').verbose();

// Create/connect to database
const db = new sqlite3.Database('./database.db');

// Sample products data
const sampleProducts = [
    {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
        price: 99.99,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
        stock: 25,
        category: 'electronics'
    },
    {
        name: 'Smart Fitness Watch',
        description: 'Advanced fitness tracker with heart rate monitoring, GPS, and smartphone connectivity.',
        price: 249.99,
        image_url: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=300&h=200&fit=crop',
        stock: 15,
        category: 'electronics'
    },
    {
        name: 'Organic Cotton T-Shirt',
        description: 'Comfortable and sustainable organic cotton t-shirt available in multiple colors.',
        price: 29.99,
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop',
        stock: 50,
        category: 'clothing'
    },
    {
        name: 'JavaScript: The Complete Guide',
        description: 'Comprehensive guide to modern JavaScript programming with practical examples.',
        price: 45.99,
        image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=200&fit=crop',
        stock: 30,
        category: 'books'
    },
    {
        name: 'Portable Bluetooth Speaker',
        description: 'Compact wireless speaker with excellent sound quality and waterproof design.',
        price: 79.99,
        image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&h=200&fit=crop',
        stock: 20,
        category: 'electronics'
    },
    {
        name: 'Premium Coffee Beans',
        description: 'Single-origin arabica coffee beans, freshly roasted for the perfect cup.',
        price: 24.99,
        image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=200&fit=crop',
        stock: 40,
        category: 'home'
    },
    {
        name: 'Yoga Mat Pro',
        description: 'Professional-grade yoga mat with superior grip and cushioning for all practice levels.',
        price: 69.99,
        image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop',
        stock: 35,
        category: 'home'
    },
    {
        name: 'Vintage Denim Jacket',
        description: 'Classic denim jacket with vintage wash and comfortable fit.',
        price: 89.99,
        image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=200&fit=crop',
        stock: 12,
        category: 'clothing'
    },
    {
        name: 'Web Development Bootcamp',
        description: 'Complete guide to full-stack web development including HTML, CSS, JavaScript, and Node.js.',
        price: 59.99,
        image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
        stock: 25,
        category: 'books'
    },
    {
        name: 'Wireless Phone Charger',
        description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
        price: 39.99,
        image_url: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=300&h=200&fit=crop',
        stock: 0, // Out of stock item
        category: 'electronics'
    },
    {
        name: 'Indoor Plant Collection',
        description: 'Set of 3 easy-care indoor plants perfect for home or office decoration.',
        price: 49.99,
        image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
        stock: 18,
        category: 'home'
    },
    {
        name: 'Running Shoes',
        description: 'Lightweight running shoes with advanced cushioning and breathable mesh upper.',
        price: 129.99,
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop',
        stock: 22,
        category: 'clothing'
    }
];

console.log('Initializing database with sample data...');

db.serialize(() => {
    // Create tables if they don't exist
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    )`);

    // Clear existing products (optional - remove this line if you want to keep existing data)
    db.run('DELETE FROM products');

    // Insert sample products
    const stmt = db.prepare('INSERT INTO products (name, description, price, image_url, stock, category) VALUES (?, ?, ?, ?, ?, ?)');
    
    sampleProducts.forEach(product => {
        stmt.run([
            product.name,
            product.description,
            product.price,
            product.image_url,
            product.stock,
            product.category
        ]);
    });

    stmt.finalize();

    console.log(`✅ Database initialized with ${sampleProducts.length} sample products!`);
    console.log('Categories available: electronics, clothing, books, home');
    console.log('You can now start the server with: npm start');
});

db.close();
