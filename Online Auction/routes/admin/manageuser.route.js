const express = require('express');
const restrict = require('../../middlewares/auth.mdw');
const userModel = require('../../models/user.model');
const requestUpdateModel = require('../../models/requestupdate.model');
const downgradeModel = require('../../models/downgrade.model');
const categoryModel = require('../../models/category.model');
const productModel = require('../../models/product.model');
const bidModel = require('../../models/bid.model');
const router = express.Router();

//Quản lý users
router.get('/manage', restrict.forUserNotAdmin, async (req, res) => {
    //Lấy ra những users không phải admin
    const rows = await userModel.allUserNotAdmin();
    res.render('vwAdmin/vwUserManager/manage', {
        users: rows
    });
})

//Xử lý xóa 
router.post('/manage/:id/del', async (req, res) => {
    //Xóa tất cả các lần đấu giá đó
    const result1 = await bidModel.delByUserID(req.params.id);
    //Nếu là seller thì xóa các sản phẩm mà seller đã đăng
    const result2 = await productModel.delBySellerID(req.params.id);
    //Xóa user trong db
    const rows = await userModel.delByID(req.params.id);
    console.log(req.body.username);
    req.flash('success_msg', 'Delete user success');
    res.redirect('/admin/user/manage');
})

//View profile user
router.get('/manage/:id/profile', restrict.forUserNotAdmin, async (req, res) => {
    //Lấy ra user có UserID
    const userID = req.params.id;
    const user = await userModel.singleByUserID(userID);
    res.render('vwAdmin/vwUserManager/profileuser', {
        user: user,
    });
})


//Nâng cấp - hạ cấp users
router.get('/updowngrade', restrict.forUserNotAdmin, async (req, res) => {
    //Lấy ra những bidder muốn nâng cấp thành seller và các seller
    const rows = await userModel.allBidderUpgradeAndSeller();
    res.render('vwAdmin/vwUserManager/updowngrade', {
        users: rows,
    });
});

//Nâng cấp bidder
router.get('/upgrade', restrict.forUserNotAdmin, async (req, res) => {
    //Lấy ra những bidder muốn nâng cấp thành seller
    const rows = await userModel.allBidderWantToBeSeller();
    res.render('vwAdmin/vwUserManager/upgrade', {
        users: rows,
    });
});

//Hạ cấp seller
router.get('/downgrade', restrict.forUserNotAdmin, async (req, res) => {
    //Lấy ra những bidder muốn nâng cấp thành seller và các seller
    const rows = await userModel.allSeller();
    res.render('vwAdmin/vwUserManager/downgrade', {
        users: rows,
    });
});

router.post('/updowngrade/:id/up', async (req, res) => {
    //Nâng cấp cho user đổi type = 1(lên seller)
    //Set IsRefuse trong bảng RequestUpdate thành 0 (tức là nâng cấp)
    //Thêm 1 dòng vào bảng Downgrade
    const Type = { Type: 1 };
    const IsRefuse = { IsRefuse: 0 };

    const user = await userModel.singleByUserID(req.params.id);
    const add = { Username: "", IsDown: "" };
    add.Username = user.Username;
    add.IsDown = 0;
    const [result, result1, result2] = await Promise.all([
        requestUpdateModel.patch(IsRefuse, user.Username),
        downgradeModel.add(add),
        userModel.patch(Type, user.Username),
    ]);
    req.flash('success_msg', 'Upgrade success');
    res.redirect('/admin/user/updowngrade');
});

router.post('/updowngrade/:id/reject', async (req, res) => {
    //Từ chối nâng cấp cho user
    //Set IsRefuse trong bảng RequestUpdate thành 1 (tức là từ chối)
    const IsRefuse = { IsRefuse: 1 };
    const user = await userModel.singleByUserID(req.params.id);
    const result = await requestUpdateModel.patch(IsRefuse, user.Username);
    req.flash('success_msg', 'Reject success');
    res.redirect('/admin/user/updowngrade');
});

router.post('/updowngrade/:id/down', async (req, res) => {
    //Xóa tất cả các sản phẩm mà người dùng đã đăng(khi còn là seller)
    const result = await productModel.delBySellerID(req.params.id);
    //Hạ cấp cho user đổi type = 0(xuống bidder)
    const Type = { Type: 0 };
    const user = await userModel.singleByUserID(req.params.id);
    const result1 = await userModel.patch(Type, user.Username);
    //Cho IsDown = 1 để thông báo cho user biết
    const IsDown = { IsDown: 1 };
    const result2 = await downgradeModel.patch(IsDown, user.Username);
    req.flash('success_msg', 'Downgrade success');
    res.redirect('/admin/user/updowngrade');
});

module.exports = router;