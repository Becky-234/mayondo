const express = require('express');
const router = express.Router();


//Dashboard Page
router.get('/dashboard', (req, res) => {
    if (!req.user) return res.redirect('/login')
    res.render('dashboard', { currentUser: req.user });
});

router.post('/dashboard', (req, res) => {
    console.log(req.body);
});













module.exports = router;