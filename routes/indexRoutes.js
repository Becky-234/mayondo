const express = require('express');
const path = require('path');
const router = express.Router();


//Landing page - serve at root
router.get('/', (req, res) => {
    res.render('index', { title: 'Landing Page' });
});

router.get('/index', (req, res) => {
    res.render('index', { title: 'Landing Page' });
});

router.post('/index', (req, res) => {
    console.log(req.body);
    res.redirect('/login');
});


module.exports = router;