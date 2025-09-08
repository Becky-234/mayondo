const express = require('express');
const router = express.Router();


//Landing page
router.get('/index', (req, res) => {
    res.render('index', { title: 'Landing page' });
});

router.post('/index', (req, res) => {
    console.log(req.body);
    res.redirect('/login');
});


module.exports = router;