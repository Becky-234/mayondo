const express = require('express');
const router = express.Router();


//Sales page
router.get('/sales', (req, res) => {
    res.render('sales', { title: 'Sales page' });
});

router.post('/sales', (req, res) => {
    console.log(req.body);
});

//Add sales page
router.get('/addSale', (req, res) => {
    res.render('addSale', { title: 'Add sales page' });
});

router.post('/addSale', (req, res) => {
    console.log(req.body);
});











module.exports = router;