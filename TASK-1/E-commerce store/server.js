const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('./database.db');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize database tables
db.serialize(() => {
    // Products table
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

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Order items table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    )`);
});

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(row);
    });
});

// Add new product
app.post('/api/products', (req, res) => {
    const { name, description, price, image_url, stock, category } = req.body;
    
    if (!name || !price) {
        res.status(400).json({ error: 'Name and price are required' });
        return;
    }

    db.run(
        'INSERT INTO products (name, description, price, image_url, stock, category) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, price, image_url, stock || 0, category],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'Product added successfully' });
        }
    );
});

// Create order
app.post('/api/orders', (req, res) => {
    const { customer_name, customer_email, customer_phone, items } = req.body;
    
    if (!customer_name || !customer_email || !items || items.length === 0) {
        res.status(400).json({ error: 'Customer details and items are required' });
        return;
    }

    // Calculate total amount
    let total_amount = 0;
    let validationPromises = [];

    items.forEach(item => {
        validationPromises.push(new Promise((resolve, reject) => {
            db.get('SELECT price, stock FROM products WHERE id = ?', [item.product_id], (err, row) => {
                if (err) reject(err);
                if (!row) reject(new Error(`Product ${item.product_id} not found`));
                if (row.stock < item.quantity) reject(new Error(`Insufficient stock for product ${item.product_id}`));
                
                total_amount += row.price * item.quantity;
                resolve();
            });
        }));
    });

    Promise.all(validationPromises)
        .then(() => {
            // Create order
            db.run(
                'INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount) VALUES (?, ?, ?, ?)',
                [customer_name, customer_email, customer_phone, total_amount],
                function(err) {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    const orderId = this.lastID;

                    // Add order items
                    const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
                    
                    items.forEach(item => {
                        db.get('SELECT price FROM products WHERE id = ?', [item.product_id], (err, row) => {
                            if (!err && row) {
                                stmt.run([orderId, item.product_id, item.quantity, row.price]);
                                
                                // Update stock
                                db.run('UPDATE products SET stock = stock - ? WHERE id = ?', 
                                    [item.quantity, item.product_id]);
                            }
                        });
                    });

                    stmt.finalize();
                    res.json({ id: orderId, message: 'Order created successfully', total_amount });
                }
            );
        })
        .catch(err => {
            res.status(400).json({ error: err.message });
        });
});

// Get all orders
app.get('/api/orders', (req, res) => {
    db.all(`
        SELECT o.*, GROUP_CONCAT(p.name || ' (x' || oi.quantity || ')') as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`E-commerce server running on http://localhost:${PORT}`);
});

module.exports = app;
