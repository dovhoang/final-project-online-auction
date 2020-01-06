const express = require('express');
const productModel = require('../models/product.model');
const blacklistModel = require('../models/blacklist.model');
const bidModel = require('../models/bid.model');
const userModel = require('../models/user.model');
const helper = require('../helper/helper');
const router = express.Router();
const moment = require('moment');
var cron = require('node-cron');

cron.schedule('* * * * *', async () => {
  //Lấy ra thời gian kết thúc của tất cả các sản phẩm có IsOver = 0 (tức là chưa kết thúc)
  const product = await productModel.allTimeExpExceptIsOver();
  for (var i = 0; i < product.length; i++) {
    if (product[i].TimeExp.getTime() < Date.now()) {//Nếu sản phẩm đó đã kết thúc
      //Cập nhật lại biến IsOver = 1 tức là đã kết thúc
      const condition = { ProductID: product[i].ProductID };
      const IsOver = { IsOver: 1 };
      const result = await productModel.patch2(IsOver, condition);
      //Tìm ra email của người bán sản phẩm
      const emailSeller = await userModel.singleByUserID(product[i].SellerID);
      //Nếu có người đấu giá
      if (product[i].CurrentBid != product[i].PriceStart) {
        //Tìm ra userid của người đó với currentbid
        const user = await bidModel.singleByProIDAndAmount(product[i].ProductID, product[i].CurrentBid);
        //Tìm ra email của người đó với userid tìm được để gửi mail
        const emailWinner = await userModel.singleByUserID(user.UserID);
        //Gửi mail
        helper.sendMail(emailWinner.Email, 'Congratulation...You have a won product', `You have won on product ${product[i].ProductName}`);
        //Gửi mail người bán
        helper.sendMail(emailSeller.Email, 'Congratulation...Your product have a winner', `The winner is ${emailWinner.Username} with amount = ${product[i].CurrentBid} $`)
      } else {
        //Nếu không có người đấu giá => gửi mail cho người bán
        helper.sendMail(emailSeller.Email, `Unfortunately...Your product ${product[i].ProductName} ended with no winner`, `Sorry for that`);
      }
    }
  }
});

router.get('/id=:id', async (req, res) => {
  var userTmp = null;
  if (req.session.isAuthenticated) userTmp = req.session.authUser.UserID;
  const isBlocked = await bidModel.checkBlock(req.params.id, userTmp);
  console.log(isBlocked);
  if (isBlocked.length != 0 && isBlocked[0].isBlocked != 1) {
    const proid = req.params.id;
    const [prd, sli, cwi, g4, review, relatedPrd, fvr, score, mp, cp] = await Promise.all([
      productModel.single(proid),
      productModel.getSellerInfo(proid),
      productModel.getCurrentWinner(proid),
      productModel.get3TimesLatestPrice(proid),
      productModel.getReview(proid),
      productModel.get5RelatedProduct(proid),
      productModel.fvr(proid, userTmp),
      bidModel.getScore(userTmp),
      bidModel.MaxPrice(proid, userTmp),
      productModel.getCateParent(proid),
    ]);
    var reviewLength = 0, isWinner = false, MaxPrice_AutoBid = null;
    var curPrice = 0, scoretmp = 0;
    if (req.session.isAuthenticated && cwi[0].length != 0) {
      isWinner = (cwi[0][0].userID === req.session.authUser.UserID);
      curPrice = cwi[0][0].CurrentBid;
    }
    if (mp.length != 0) {
      if (req.session.isAuthenticated && mp[0].Price > curPrice) {
        MaxPrice_AutoBid = mp[0].Price;
      }
    }
    if (review[0].length != 0) reviewLength = review[0][0].CountRevByID;
    if (score.length === 0) scoretmp = -2;
    else scoretmp = score[0].score;
    res.render('vwSingleProduct/single', {
      Productid: proid,
      product: prd[0],
      catparent: cp[0],
      PrdEmpty: prd[0].length === 0,
      sellerInfo: sli[0],
      isSeller: sli[0][0].UserID === userTmp,
      curWinnerInfo: cwi[0],
      InfoLastestAuction: g4[0],
      review: review[0],
      reviewLength: reviewLength,
      relatedPrd: relatedPrd[0],
      favorite: fvr,
      score: scoretmp,
      isWinner: isWinner,
      autoBidPrice: MaxPrice_AutoBid,
      isBlocked: false
    });
  }
  else res.render('vwSingleProduct/single', {
    isBlocked: true
  });
});
router.post('/id=:id', async (req, res) => {
  if (req.body.key === 'bid') {
    delete req.body.key;
    if (req.session.isAuthenticated) {
      const score = await bidModel.getScore(req.session.authUser.UserID);
      //diem danh gia tren 80%
      if (score[0].score >= 0.8) {
        //
        const status = await bidModel.fAuction(req.params.id, req.session.authUser.UserID, req.body.Price);
        //Nếu đấu giá thành công
        if (status[0].Auction === 1) {
          //Tìm tên sản phẩm và thằng seller
          const product = await productModel.singleByProID(req.params.id);
          //Tìm ra email của thằng seller
          const user1 = await userModel.singleByUserID(product.SellerID);
          //Gửi mail
          const result1 = helper.sendMail(req.session.authUser.Email, 'Auction product',
            `<b>Bid successfully on product ` + product.ProductName + `</b>`);
          if (result1 === false) console.log("Lỗi send email");
          else console.log("Send mail thành công");

          const result2 = helper.sendMail(user1.Email, 'Auction product',
            `<b>` + req.session.authUser.Username + ` bid successfully on your ` + product.ProductName + ` product</b>`);
          if (result2 === false) console.log("Lỗi send email");
          else console.log("Send mail thành công");
          //Cần tìm ra người giữ giá trước đó
          //Tìm ra userid của người giữ giá trước đó
          const result3 = await bidModel.getSecondLarghAmountWithProID(req.params.id);
          //Tìm ra email của người giữ giá trước đó
          const user = await userModel.singleByUserID(result3.UserID);
          //Gửi mail
          if (user !== null) {
            const result4 = helper.sendMail(user.Email, 'Auction product',
              `<b>Someone has take a lead on product ` + product.ProductName + `</b>`);
            if (result4 === false) console.log("Lỗi send email");
            else console.log("Send mail thành công");
          }
        }
      }
      return res.redirect('back');
    }
  }
  if (req.body.key === 'review') {
    delete req.body.key;
    if (req.session.isAuthenticated) {
      const date = new Date();
      const entity = req.body;
      entity.UserID = req.session.authUser.UserID;
      entity.ReviewID = null;
      entity.ProductId = req.params.id;
      entity.TimePost = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      await productModel.addReview(entity);
      const tmp = await productModel.getReview(req.body.ProductId, 1);
      return res.json(tmp[0][0]);
    }
  }
  if (req.body.key === 'favorite') {
    delete req.body.key;
    if (req.session.isAuthenticated) {
      const tmpx = await productModel.fInsertFavorite(req.params.id, req.session.authUser.UserID);
      console.log(tmpx);
      if (tmpx.length != 0) return res.json(tmpx[0].result);
    }
    return res.json(0);
  }
  if (req.body.key === 'autobid') {
    delete req.body.key;
    if (req.session.isAuthenticated) {
      const score = await bidModel.getScore(req.session.authUser.UserID);
      //diem danh gia tren 80%
      if (score[0].score >= 0.8) {
        await bidModel.fAutoBid(req.params.id, req.session.authUser.UserID, req.body.Price);
      }
    }

    return res.redirect('back');
  }
  if (req.body.key === 'banbidder') {
    delete req.body.key;
    const sli = await productModel.getSellerInfo(req.params.id);
    if (req.session.isAuthenticated) {
      if (sli[0][0].UserID === req.session.authUser.UserID) {
        const userId = req.body.userId;
        const proId = req.params.id;
        const rs = await blacklistModel.add({ ProductID: proId, UserID: userId });
        await blacklistModel.removeBid(proId, userId);
        await blacklistModel.fUpdateCurWinner(proId, userId);
        return res.redirect('back');
      }
    }
  }
  return res.redirect('back');
});

module.exports = router;

