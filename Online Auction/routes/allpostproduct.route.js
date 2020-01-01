const express = require('express');
const router = express.Router();
const productModel = require('../models/product.model');
const restrict = require('../middlewares/auth.mdw');

router.get('/', restrict.forUserNotSeller, async (req, res) => {
    const products = await productModel.allBySellerID(req.session.authUser.UserID);
    res.render('vwAllPostProduct/allpostproduct', {
        products
    });
})

module.exports = router;