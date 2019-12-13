module.exports = function (app) {
    app.use('/admin/categories', require('../routes/admin/category.route'));
  };