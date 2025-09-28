const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Manager', 'Sales Agent'],
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    phone: String,
    department: String,
    region: String,
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('UserModel', userSchema);