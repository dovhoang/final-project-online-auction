const express = require('express');
const productModel = require('../models/product.model');
const router = express.Router();
router.get('/id=:id', async (req, res) => {
  const proid = req.params.id;
  const [prd, sli, cwi, g4, review, relatedPrd] = await Promise.all([
    productModel.single(proid),
    productModel.getSellerInfo(proid),
    productModel.getCurrentWinner(proid),
    productModel.get3TimesLatestPrice(proid),
    productModel.getReview(proid),
    productModel.get5RelatedProduct(proid)
  ]);
  var reviewLength=0;
  if (review[0].length!=0)  reviewLength=review[0][0].CountRevByID;
  res.render('vwSingleProduct/single', {
    Productid: proid,
    product: prd[0],
    PrdEmpty: prd[0].length === 0,
    sellerInfo: sli[0],
    curWinnerInfo: cwi[0],
    InfoLastestAuction: g4[0],
    review: review[0],
    reviewLength:reviewLength,
    relatedPrd: relatedPrd[0]
  });

});
router.post('/id=:id', async (req, res) => {
  if (req.body.key==='bid')
  {
    delete req.body.key;
 const status=await productModel.fAuction(req.body.ProductId,req.session.authUser.UserID,req.body.Price);
console.log(status[0].Auction);
    return res.redirect('back');
  }
else 
{
  delete req.body.key;
  const date = new Date();
  const entity = req.body;
  entity.UserID=  req.session.authUser.UserID;
  entity.ReviewID = null;
  entity.TimePost = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
    date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  console.log(entity);
  await productModel.addReview(entity);
  const tmp=await productModel.getReview(req.body.ProductId,1);
  res.json(tmp[0][0]);
}
})

module.exports = router;

