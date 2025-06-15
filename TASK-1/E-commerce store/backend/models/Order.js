const mongoose = require('mongoose');
const Product = require('./Product'); // Make sure path is correct

const orderSchema = new mongoose.Schema({
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        zip: { type: String, required: true }
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    total: {
        type: Number
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate total before saving
orderSchema.pre('save', function(next) {
    this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    next();
});

// ✅ Update stock after order is saved
orderSchema.post('save', async function(order, next) {
    try {
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } }, // ⬇ Decrease stock
                { new: true }
            );
        }
        next();
    } catch (err) {
        console.error('Error updating stock:', err);
        next(err);
    }
});

module.exports = mongoose.model('Order', orderSchema);
