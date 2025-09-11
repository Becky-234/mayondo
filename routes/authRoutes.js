express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');

//Getting the manager signup form
router.get('/signup', (req, res) => {
    res.render('signup', { title: 'signup page' })
});

router.post('/signup', (req, res) => {
    const user = new UserModel(req.body);
    console.log(req.body);
    user.save()
    res.redirect('/login');
});


//Getting the Login form
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login page' })
});

router.post('/login', (req, res) => {
    console.log(req.body);
    res.redirect('/dashboard');
});

//LOGGING OUT
// router.get('/logout', (req, res) => {
//     if (req.session) {
//         req.session.destroy((error) => {
//             if (error) {
//                 return res.status(500).send('Error logging out')
//             }
//             res.redirect('/');
//         })
//     }
// });



module.exports = router;
