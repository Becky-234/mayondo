const express = require('express');
const router = express.Router();


//Stock page
router.get('/stock', (req, res) => {
    res.render('stock', { title: 'Stock page' });
});

router.post('/stock', (req, res) => {
    console.log(req.body);
});


//Add stock page
router.get('/addstock', (req, res) => {
    res.render('addstock', { title: 'Add stock page' });
});

router.post('/addstock', (req, res) => {
    console.log(req.body);
});



module.exports = router;