const express = require('express');
const router = express.Router();

const SalesModel = require('../models/salesModel');

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

router.post('/addSale', async (req, res) => {
    try {
        const sales = new SalesModel(req.body);
        console.log(req.body);
        await sales.save();
        res.redirect('/sales');
    } catch (error) {
        console.error(error);
        res.redirect('/addSale');
    }
});

router.get('/sales', (req, res) => {
    res.render('sales');
});







module.exports = router;