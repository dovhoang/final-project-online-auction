const categoryModel = require('../models/category.model');

module.exports = function (app) {
  app.use(async (req, res, next) => {
    const rows = await categoryModel.all();
    console.log("all:", rows);
    res.locals.lcCatAll = rows;
    next();
  });
  app.use(async (req, res, next) => {
    const rows = await categoryModel.allCatLevel1();
    console.log("lev1: ",rows);
    res.locals.lcCatLevel1 = rows;
    next();
  });
};


