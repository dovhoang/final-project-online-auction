const express = require('express');
const router = express.Router();
const productModel = require('../models/product.model');
const restrict = require('../middlewares/auth.mdw');

//View favorite
router.get('/', restrict.forUserNotSignIn, restrict.forAdmin, async (req, res) => {
    const list = await productModel.getFavoriteProduct(req.session.authUser.UserID);
    console.log(list[0]);
    res.render('vwFavorite/favorite', {
        list: list[0],
    });
});
router.post('/', async (req, res) => {
    await productModel.delInFav(req.body.ProductID, req.session.authUser.UserID);
    res.redirect('back');
});

module.exports = router;