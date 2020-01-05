
module.exports = function (app) {
  app.use('/account', require('../routes/account.route'));
  app.use('/categories', require('../routes/category.route'));
  app.use('/admin/categories', require('../routes/admin/category.route'));
  app.use('/admin/user', require('../routes/admin/manageuser.route'));
  app.use('/product', require('../routes/product.route'));
  app.use('/', require('../routes/home.route'));
  app.use('/search', require('../routes/search.route'));
  app.use('/favorite', require('../routes/favorite.route'));
  app.use('/wonproduct', require('../routes/wonproduct.route'));
  app.use('/auctionproduct', require('../routes/auctionproduct.route'));
  app.use('/forgotpassword', require('../routes/forgotpassword.route'));
  app.use('/postproduct', require('../routes/postproduct.route'));
  app.use('/allpostproduct', require('../routes/allpostproduct.route'));
  app.use('/bidder', require('../routes/bidder.route'));
  app.use('/seller', require('../routes/seller.route'));
};