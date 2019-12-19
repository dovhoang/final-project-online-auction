
const express = require('express');
const productModel = require('../models/product.model');
const router = express.Router();


router.get('/id=:id', async (req, res) => {
  const prd = await productModel.single(req.params.id);
  const sli = await productModel.getSellerInfo(req.params.id);
  const cwi=await productModel.getCurrentWinner(req.params.id);
  const g4=await productModel.get3TimesLatestPrice(req.params.id);
  console.log(g4);
  res.render('vwSingleProduct/single', {
    product: prd,
    PrdEmpty: prd.length === 0,
    sellerInfo:sli[0],
    sellerInfoEmpty:sli[0].length===0,
    curWinnerInfo:cwi[0],
    curWinnerInfoEmpty:cwi[0].length===0,
    Info:g4,
    Info:g4.length===0,
  });
})

module.exports = router;