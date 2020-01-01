const express = require('express');
const router = express.Router();
const restrict = require('../middlewares/auth.mdw');

router.get('/', async (req, res) => {
    // const list = await productModel.getWonProduct(req.session.authUser.UserID);
    res.render('vwReview/reviewseller', {
        // list: list[0],
    });
});

module.exports = router;