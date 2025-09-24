const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    pdtname: {
        type: String,
        required: true
    },
    pdttype: {
        type: String,
        trim: true,
        required: true
    },
    pdtquantity: {
        type: Number,
        trim: true,
        required: true
    },
    cprice: {
        type: String,
        required: true
    },
    pdtprice: {
        type: String,
        required: true
    },
    supplier: {
        type: String,
        required: true
    },
    supplierContact: {
        type: String,
        required: true
    },
    quality: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('StockModel', stockSchema);

