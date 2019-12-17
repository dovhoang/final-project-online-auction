module.exports = function (app) {
  app.use('/account', require('../routes/account.route'));
  app.use('/user/categories', require('../routes/user/category.route'));
  app.use('/admin/categories', require('../routes/admin/category.route'));
};