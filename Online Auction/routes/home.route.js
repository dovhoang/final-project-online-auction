const express = require('express');
const productModel = require('../models/product.model');
const router = express.Router();

router.get('/', async (req, res) => {
 const [toend,popular,hprice] = await Promise.all([
     productModel.getTop5ToEnd(),
     productModel.getTop5PopularBid(),
     productModel.getTop5Price()
 ]);
 res.render('vwHome/index',{
     top5ToEnd : toend[0],
     top5Popular: popular[0],
     top5Price : hprice[0]
 });
});
module.exports = router;