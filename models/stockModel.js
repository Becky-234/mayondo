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
        // enum: {
        //     values: ['Raw', 'Furniture']
        // }
    },
    pdtquantity1: {
        type: Number,
        required: [true, 'Total Product quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        // validate: {
        //     validator: Number.isInteger,
        //     message: 'Quantity must be a whole number'
        // }
    },
    pdtquantity: {
        type: Number,
        required: [true, 'Product quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        // validate: {
        //     validator: Number.isInteger,
        //     message: 'Quantity must be a whole number'
        // }
    },
    cprice: {
        type: Number,
        required: [true, 'Cost price is required'],
        min: [0, 'Cost price cannot be negative']
    },
    pdtprice: {
        type: Number,
        required: [true, 'Product price is required'],
        // min: [0, 'Product price cannot be negative'],
        // validate: {
        //     validator: function (value) {
        //         return value >= this.cprice;
        //     },
        //     message: 'Product price should be greater than or equal to cost price'
        // }
    },
    supplier: {
        type: String,
        required: [true, 'Supplier name is required'],
        trim: true,
        maxlength: [100, 'Supplier name cannot exceed 100 characters']
    },
    supplierContact: {
        type: String,
        required: [true, 'Supplier contact is required'],
        trim: true,
        // validate: {
        //     validator: function (v) {
        //         // Basic phone number validation for Uganda
        //         return /^\+256\d{9}$/.test(v) || /^0\d{9}$/.test(v);
        //     },
        //     message: 'Please provide a valid Ugandan phone number'
        // }
    },
    quality: {
        type: String,
        required: [true, 'Quality rating is required'],
        enum: {
            values: ['Premium', 'Good', 'Fair', 'Poor'],
            message: 'Quality must be Premium, Good, Fair, or Poor'
        }
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        // validate: {
        //     validator: function (date) {
        //         return date <= new Date();
        //     },
        //     message: 'Date cannot be in the future'
        // }
    }
    //     addedBy: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'UserModel',
    //         required: true
    //     }
    // }, {
    //     timestamps: true // Adds createdAt and updatedAt automatically
});


module.exports = mongoose.model('StockModel', stockSchema); // Changed to 'Stock' for consistency