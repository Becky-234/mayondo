const express = require('express');
const router = express.Router();

const StockModel = require('../models/stockModel');


//Stock page
router.get('/stock', (req, res) => {
    res.render('stock', { title: 'Stock page' });
});

router.post('/stock', (req, res) => {
    console.log(req.body);
});


//Add stock page
router.get('/addStock', (req, res) => {
    res.render('addStock', { title: 'Stock page' });
});


router.post('/addStock', async (req, res) => {
    try {
        const stock = new StockModel(req.body);
        console.log(req.body);
        await stock.save();
        res.redirect('/stock');
    } catch (error) {
        console.error(error);
        res.redirect('/addStock');
    }
});

router.get('/stock', (req, res) => {
    res.render('stock');
});



module.exports = router;

