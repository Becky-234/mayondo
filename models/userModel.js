const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: true
    },
    password: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('UserModel', loginSchema);