const categoryModel = require('../models/category.model');
const userModel = require('../models/user.model')

module.exports = app => {
  app.use(async (req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.signinsuccess = req.flash('signinsuccess');
    res.locals.signoutsuccess = req.flash('signoutsuccess');

    if (req.session.authUser !== undefined && req.session.authUser !== null && req.session.authUser.Type === 2) {
      const Users = await userModel.countUsers();
      res.locals.countUsers = Users[0].totalUsers;

      const all = await userModel.countAll();
      res.locals.countAll = all;

      const allBidder = await userModel.countBidderWantToBeSeller();
      res.locals.countAllBidder = allBidder[0].totalBidder;

      const allSeller = await userModel.countSeller();
      res.locals.countAllSeller = allSeller[0].totalSeller;
    }
    if (typeof (req.session.isAuthenticated) === 'undefined') {
      req.session.isAuthenticated = false;
    }
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.authUser = req.session.authUser;
    next();
  });
  app.use(async (req, res, next) => {
    const rows = await categoryModel.all();
    res.locals.lcCatAll = rows;
    next();
  });
  //Cập nhật lại biến session
  app.use(async (req, res, next) => {
    if (req.session.authUser !== undefined && req.session.authUser !== null && req.session.authUser.Type != 2) {
      //Lấy lại user đang đăng nhập trong db xem có gì thay đổi không
      const user = await userModel.singleByUserID(req.session.authUser.UserID);
      if (user.Type !== req.session.authUser.Type) {
        req.session.authUser.Type = user.Type;
        res.locals.authUser = req.session.authUser;
      }
    }
    next();
  });
  
  app.use(async (req, res, next) => {
    const rows = await categoryModel.allCatLevel1();
    res.locals.lcCatLevel1 = rows;
    next();
  });
};


