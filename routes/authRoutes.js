const express = require('express');
const router = express.Router();


//Login page
router.get('/login', (req, res) => {
    res.render('login', {title: 'Login here!'});
});

router.post('/login', (req, res) => {
    console.log(req.body);
    res.redirect('/dashboard');
});


//Signup page
router.get('/signup', (req, res) => {
    res.render('signup', {title: 'Signup page'});
});

router.post('/signup', (req, res) => {
    console.log(req.body);
    res.redirect('/login');
});







module.exports = router;