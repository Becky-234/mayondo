const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    tel: {
        type: String,
        required: [true, 'Phone number is required']
    },
    nin: {
        type: String,
        required: [true, 'NIN is required']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['manager', 'sales_agent'],
        default: 'sales_agent'
    },
    managerId: {  // ADD THIS FIELD
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        default: null
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    }
}, {
    timestamps: true
});



module.exports = mongoose.model('UserModel', userSchema);