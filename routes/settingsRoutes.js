express = require("express");
const router = express.Router();
//const UserModel = require("../models/userModel");
const passport = require("passport");



router.get('/settings', (req, res) => {
    res.render('settings', { title: 'Settings page' });
});


router.post('/settings', (req, res) => {
    console.log(req.body);
    res.redirect('/settings');
});




module.exports = router;