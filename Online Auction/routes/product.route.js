const express = require('express');
const productModel = require('../models/product.model');
const router = express.Router();


router.get('/id=:id', async (req, res) => {
  const proid=req.params.id;
  const [prd,sli,cwi,g4,review,relatedPrd] = await Promise.all([
     productModel.single(proid),
     productModel.getSellerInfo(proid),
     productModel.getCurrentWinner(proid),
     productModel.get3TimesLatestPrice(proid),
     productModel.getReview(proid),
     productModel.get5RelatedProduct(proid)
  ]);
  res.render('vwSingleProduct/single', {
    
    product: prd[0],
    PrdEmpty: prd[0].length === 0,
    sellerInfo:sli[0],
    curWinnerInfo:cwi[0],
    InfoLastestAuction:g4[0],
    review:review[0],
    reviewLength:review[0].length,
    relatedPrd:relatedPrd[0]
  });
});

router.post('/id=:id',async (req, res) => {
  var date=new Date();
  const entity=req.body;
  entity.revID=null;
  entity.proID=3;
  entity.userID=3;
  entity.ratting=4,
  entity.time_post=date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
    date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  console.log(entity);
  alert("This is alert box!");
   const result=await productModel.addReview(entity);
   console.log(request.body.comment);
   res.render('vwSingleProduct/single');
})

module.exports = router;


