const categoryModel = require('../models/category.model');
const userModel = require('../models/user.model')

module.exports = app => {
  app.use(async (req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');

    const all = await userModel.countAll();
    res.locals.countAll = all[0].total;

    const allBidder = await userModel.countBidderWantToBeSeller();
    res.locals.countAllBidder = allBidder[0].totalBidder;
    
    const allSeller = await userModel.countSeller();
    res.locals.countAllSeller = allSeller[0].totalSeller;
    // res.locals.lcCategories = rows;
    // res.locals.otp = req.flash('otp');
    if (typeof (req.session.isAuthenticated) === 'undefined') {
      req.session.isAuthenticated = false;
    }
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.authUser = req.session.authUser;
    next();
  });
  app.use(async (req, res, next) => {
    const rows = await categoryModel.all();
    console.log("all:", rows);
    res.locals.lcCatAll = rows;
    next();
  });
  app.use(async (req, res, next) => {
    const rows = await categoryModel.allCatLevel1();
    console.log("lev1: ", rows);
    res.locals.lcCatLevel1 = rows;
    next();
  });
};


