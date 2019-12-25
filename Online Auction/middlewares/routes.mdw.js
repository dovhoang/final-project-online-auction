
module.exports = function (app) {
  app.use('/account', require('../routes/account.route'));
  app.use('/user/categories', require('../routes/user/category.route'));
  app.use('/admin/categories', require('../routes/admin/category.route'));
  app.use('/admin/user', require('../routes/admin/user.route'));
  app.use('/product', require('../routes/product.route'));
  app.use('/', require('../routes/home.route'));
};