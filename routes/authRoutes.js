const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');


//Login page
router.get('/login', (req, res) => {
    res.render('login', {title: 'Login here!'});
});

router.post('/login', (req, res) => {
    const user = new UserModel(req.body);
    console.log(req.body);
    user.save();
    res.redirect('/dashboard');
});


//Signup page
router.get('/signup', (req, res) => {
    res.render('signup', {title: 'Signup here!'});
});

router.post('/signup', (req, res) => {
    console.log(req.body);
    res.redirect('/login');
});







module.exports = router;