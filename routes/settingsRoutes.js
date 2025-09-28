const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");

router.get('/settings', (req, res) => {
    res.render('settings')
});


router.post('/settings', (req, res) => {
    res.redirect('/settings')
});


module.exports = router;