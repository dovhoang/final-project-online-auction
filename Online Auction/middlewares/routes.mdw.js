
module.exports = function (app) {
  app.use('/account', require('../routes/account.route'));
  app.use('/categories', require('../routes/category.route'));
  app.use('/admin/categories', require('../routes/admin/category.route'));
  app.use('/admin/user', require('../routes/admin/manageuser.route'));
  app.use('/product', require('../routes/product.route'));
  app.use('/', require('../routes/home.route'));
  app.use('/search', require('../routes/search.route'));
};