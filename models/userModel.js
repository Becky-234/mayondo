const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const signupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
});

signupSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
});
module.exports = mongoose.model('UserModel', signupSchema);