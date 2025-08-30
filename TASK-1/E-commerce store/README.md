<<<<<<< HEAD
# Simple E-commerce Store

A fully functional e-commerce web application with product listings, shopping cart, and order management. Built with Express.js backend, SQLite database, and vanilla HTML/CSS/JavaScript frontend.

## Features

### Frontend
- **Product Listings**: Browse products with filtering by category and search functionality
- **Shopping Cart**: Add/remove items, adjust quantities, and view cart total
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Product Categories**: Electronics, Clothing, Books, Home & Garden
- **Stock Management**: Real-time stock display and out-of-stock handling

### Backend
- **RESTful API**: Clean API endpoints for products and orders
- **Database**: SQLite database for data persistence
- **Order Processing**: Complete order management with customer details
- **Admin Panel**: Add new products and view orders

### Admin Features
- **Product Management**: Add new products with images, descriptions, and stock levels
- **Order Tracking**: View all orders with customer details and order items
- **Inventory Control**: Automatic stock updates after purchases

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database with Sample Data**
   ```bash
   npm run init-db
   ```

3. **Start the Server**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open your browser and navigate to: `http://localhost:3000`

## Usage Guide

### Customer Interface

1. **Browse Products**
   - View all products on the main page
   - Use category filter to narrow down products
   - Search for specific products using the search bar

2. **Shopping Cart**
   - Click "Add to Cart" on any product
   - Click the cart icon to view cart contents
   - Adjust quantities or remove items in the cart
   - View real-time total calculation

3. **Checkout Process**
   - Click "Checkout" in the cart modal
   - Fill in customer information (name, email, phone)
   - Review order summary
   - Submit order

### Admin Interface

1. **Access Admin Panel**
   - Click the "Admin" button in the header
   - Switch between "Add Product" and "View Orders" tabs

2. **Add New Products**
   - Fill in product details (name, description, price, etc.)
   - Add image URL for product photos
   - Set stock quantity and category
   - Submit to add to catalog

3. **View Orders**
   - See all customer orders with details
   - View order status, customer info, and items ordered
   - Track order history and totals

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get specific product
- `POST /api/products` - Add new product

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order

## Database Schema

### Products Table
- `id` - Primary key
- `name` - Product name
- `description` - Product description
- `price` - Product price
- `image_url` - Product image URL
- `stock` - Available quantity
- `category` - Product category
- `created_at` - Creation timestamp

### Orders Table
- `id` - Primary key
- `customer_name` - Customer's full name
- `customer_email` - Customer's email
- `customer_phone` - Customer's phone (optional)
- `total_amount` - Order total
- `status` - Order status
- `created_at` - Order timestamp

### Order Items Table
- `id` - Primary key
- `order_id` - Reference to order
- `product_id` - Reference to product
- `quantity` - Item quantity
- `price` - Item price at time of order

## Customization

### Adding New Categories
1. Update the category options in `public/index.html`
2. Update the category filter in `public/script.js`
3. Add new categories when creating products

### Styling
- Modify `public/styles.css` for visual customization
- Colors, fonts, and layout can be easily adjusted
- Responsive breakpoints can be modified

### Database
- The SQLite database file (`database.db`) is created automatically
- You can use any SQLite browser to view/edit data directly
- Backup the database file to preserve data

## Sample Data

The initialization script creates sample products including:
- Electronics (headphones, speakers, chargers)
- Clothing (t-shirts, jackets, shoes)
- Books (programming guides)
- Home items (plants, yoga mats, coffee)

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- Images are loaded from external URLs (Unsplash)
- Local storage is used for cart persistence
- SQLite database is suitable for small to medium traffic
- For production use, consider upgrading to PostgreSQL or MySQL

## Security Considerations

- This is a demo application - add authentication for production use
- Implement input validation and sanitization
- Add HTTPS for secure transactions
- Consider implementing rate limiting
- Add CSRF protection for forms

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the PORT in server.js or kill the process using port 3000

2. **Database not found**
   - Run `npm run init-db` to create and populate the database

3. **Images not loading**
   - Check internet connection (images are from Unsplash)
   - Replace image URLs with local images if needed

4. **Cart not persisting**
   - Check if browser localStorage is enabled
   - Clear browser cache if issues persist

## License

MIT License - feel free to use and modify for your projects!

## Contributing

This is a demo project, but suggestions and improvements are welcome!
=======
# CodeAlpha-1
>>>>>>> 7c7621e23fbf491c3f6cc894518131754b324499
