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
    productModel.getReview(proid,3),
    productModel.get5RelatedProduct(proid)
  ]);
  var reviewLength=0;
  if (review[0].length!=0)  reviewLength=review[0][0].CountRevByID;
  console.log(review);
  console.log( prd[0].length === 0);
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
    await productModel.fAuction(req.body.ProductId,req.body.UserID,req.body.Price);
    return res.redirect('back');
  }
else 
{
  const date = new Date();
  const entity = req.body;
  delete entity.key;
  entity.ReviewID = null;
  entity.TimePost = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
    date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  console.log(entity);
  const result = await productModel.addReview(entity);
  return res.end();
}
})

module.exports = router;

