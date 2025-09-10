const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    tproduct: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    nproduct: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        trim: true,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    supplier: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('SalesModel', salesSchema);

