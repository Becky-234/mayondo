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
    },
    pdtquantity: {
        type: Number,
        required: [true, 'Product quantity is required'],
        min: [0, 'Quantity cannot be negative'],
    },
    cprice: {
        type: Number,
        required: [true, 'Cost price is required'],
        min: [0, 'Cost price cannot be negative']
    },
    pdtprice: {
        type: Number,
        required: [true, 'Product price is required'],
    },
    supplier: {
        type: String,
        required: false,
        trim: true,
        maxlength: [100, 'Supplier name cannot exceed 100 characters']
    },
    supplierContact: {
        type: String,
        required: false,
        trim: true,
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
    }
});

// virtual field
stockSchema.virtual('calculatedPrice').get(function () {
    return this.cprice ? Math.round(this.cprice * 1.5) : 0;
});


module.exports = mongoose.model('StockModel', stockSchema);  