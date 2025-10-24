const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customer: {
        name: String,
        email: String,
        phone: String,
        address: {
            cep: String,
            street: String,
            number: String,
            complement: String,
            neighborhood: String,
            city: String,
            state: String
        }
    },
    items: [{
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        size: String,
        image: String
    }],
    payment: {
        method: String, // 'pix', 'credit', 'boacompra'
        status: String, // 'pending', 'approved', 'rejected'
        transactionId: String,
        amount: Number,
        currency: String
    },
    shipping: {
        cost: Number,
        method: String
    },
    total: Number,
    status: { type: String, default: 'pending' }, // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
