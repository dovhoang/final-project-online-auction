const express = require('express');
const restrict = require('../../middlewares/auth.mdw');
const userModel = require('../../models/user.model')
const categoryModel = require('../../models/category.model');
const router = express.Router();

//Quản lý users
router.get('/manage', restrict.forUserNotAdmin, async (req, res) => {
    //Lấy ra những users không phải admin
    const rows = await userModel.allWithCondition2();
    res.render('vwAdmin/vwUserManager/manage', {
        users: rows
    });
})

//Xử lý xóa 
router.post('/manage/del', async (req, res) => {
    //Xóa user trong db
    const rows = await userModel.delByName(req.body.username);
    req.flash('success_msg','Delete user success');
    res.redirect('/admin/user/manage');
})

//View profile user
router.get('/manage/:id/profile', restrict.forUserNotAdmin, async (req, res) => {
    //Lấy ra user có UserID
    const userID = req.params.id;
    const user = await userModel.singleByUserID(userID);
    res.render('vwAdmin/vwUserManager/profileuser', {
        user:user,
    });
})


//Nâng cấp - hạ cấp users
router.get('/updowngrade', restrict.forUserNotAdmin, async (req, res) => {
    //Lấy ra những bidder muốn nâng cấp thành seller và các seller
    const rows = await userModel.allWithCondition1();
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

router.post('/updowngrade/up', async (req, res) => {
    //Nâng cấp cho user đổi isUpgrade = 0 và type = 1(lên seller)
    const IsUpgrade = { IsUpgrade: 0 };
    const type = { type: 1 };
    const [result, result1] = await Promise.all([
        userModel.patch(IsUpgrade, req.body.username),
        userModel.patch(type, req.body.username)
    ]);
    req.flash('success_msg', 'Upgrade success');
    res.redirect('/admin/user/updowngrade');
});

router.post('/updowngrade/reject', async (req, res) => {
    //Từ chối nâng cấp cho user chuyển isUpgrade = 0 và type = 0
    const IsUpgrade = { IsUpgrade: 0 };
    const result1 = await userModel.patch(IsUpgrade, req.body.username);
    req.flash('success_msg', 'Reject success');
    res.redirect('/admin/user/updowngrade');
});

router.post('/updowngrade/down', async (req, res) => {
    //Hạ cấp cho user đổi isUpgrade = 0 và type = 0(xuống bidder)
    const type = { type: 0 };
    const result1 = await userModel.patch(type, req.body.username);
    req.flash('success_msg', 'Downgrade success');
    res.redirect('/admin/user/updowngrade');
});




module.exports = router;