const express = require('express');
const router = express.Router();


//Dashboard Page
router.get('/dashboard', async (req, res) => {
    if (!req.user) return res.redirect('/login')
    res.render('dashboard', { currentUser: req.user });

    //SALES REVENUE
    try {
        let totalRevenueSoftWood = await StokModel.aggregate([
            { $match: { nproduct: 'soft wood' } },
            {
                $group: {
                    _id: 'tproduct',
                    totalQuantity: { $sum: '$quantity' },
                    //Unitprice is for each item
                    totalCost: { $sum: { $multiply: ['$quantity', '$unitPrice'] } }
                }
            },

        ])
    } catch (error) {

    }

});

router.post('/dashboard', (req, res) => {
    console.log(req.body);
});













module.exports = router;