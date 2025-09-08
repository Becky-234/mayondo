const express = require('express');
const router = require.Express();


//Users page
router.get('/users', (req, res) => {
    res.render('users', { title: 'Users page' });
});

router.post('/users', (req, res) => {
    console.log(req.body);
});


//Add user page
router.get('/adduser', (req, res) => {
    res.render('adduser', { title: 'Add user page' });
});

router.post('/adduser', (req, res) => {
    console.log(req.body);
});












module.exports = router;