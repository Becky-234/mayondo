const express = require('express');
const router = express.Router();


//Products page
router.get('/products', (req, res) => {
    res.render('products', { title: 'Products page' });
});

router.post('/products', (req, res) => {
    console.log(req.body);
});














module.exports = router;