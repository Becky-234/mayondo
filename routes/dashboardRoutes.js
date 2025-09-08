const express = require('express');
const router = express.Router();


//Dashboard Page
router.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Dashboard Page' });
});

router.post('/dashboard', (req, res) => {
    console.log(req.body);
});













module.exports = router;