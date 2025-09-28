const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    tel: {
        type: String,
        required: true
    },
    tel: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['manager', 'sales_agent'],
        default: 'sales_agent'
    },
    date: {
        type: Date,
        default: Date.now
    }
});



module.exports = mongoose.model('UserModel', userSchema);