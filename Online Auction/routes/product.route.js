const express = require('express');
const productModel = require('../models/product.model');
const router = express.Router();


router.get('/id=:id', async (req, res) => {
  const proid=req.params.id;
  const [prd,sli,cwi,g4,review] = await Promise.all([
     productModel.single(proid),
     productModel.getSellerInfo(proid),
     productModel.getCurrentWinner(proid),
     productModel.get3TimesLatestPrice(proid),
     productModel.getReview(proid)
  ]);
  res.render('vwSingleProduct/single', {
    
    product: prd[0],
    PrdEmpty: prd[0].length === 0,
    sellerInfo:sli[0],
    curWinnerInfo:cwi[0],
    Info:g4[0],
    review:review[0],
    reviewLength:review[0].length
  });
});

// router.post('/post?message=:msg',async (req, res) => {
//   var date=new Date();
//   const entity=req.body;
//   entity.revID=null;
//   entity.proID=3;
//   entity.userID=3;
//   entity.ratting=4,
//   entity.comment=msg,
//   entity.time_post=date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
//     date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
//   console.log(entity);
//    const result=await productModel.addBid(entity);
//   res.render('vwSingleProduct/single');
// })

module.exports = router;


