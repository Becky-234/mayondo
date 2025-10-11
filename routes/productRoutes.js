const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/auth")

// Products page
router.get('/products', ensureAuthenticated, (req, res) => {
    res.render('products', {
        title: 'Products page',
        currentUser: req.user // ← ADD THIS LINE
    });
});

router.post('/products', ensureAuthenticated, (req, res) => {
    console.log(req.body);
});

module.exports = router;