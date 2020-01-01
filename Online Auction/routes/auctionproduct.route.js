const express = require('express');
const router = express.Router();
const productModel = require('../models/product.model');
const restrict = require('../middlewares/auth.mdw');

//View auction product'
router.get('/', restrict.forUserNotSignIn, restrict.forAdmin, async (req, res) => {
    const list = await productModel.getProductRecently(req.session.authUser.UserID);
    res.render('vwAuctionProduct/auctionproduct', {
        list: list[0],
    });
});


module.exports = router;