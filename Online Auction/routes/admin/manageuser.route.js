const express = require('express');
const restrict = require('../../middlewares/auth.mdw');
const userModel = require('../../models/user.model');
const requestUpdateModel = require('../../models/requestupdate.model');
const downgradeModel = require('../../models/downgrade.model');
const categoryModel = require('../../models/category.model');
const productModel = require('../../models/product.model');
const bidModel = require('../../models/bid.model');
const autobidModel = require('../../models/autobid.model');
const blacklistModel = require('../../models/blacklist.model');
const favoriteModel = require('../../models/favorite.model');
const util = require('util');
const fs = require('fs');
const router = express.Router();
const moment = require('moment');

//Quản lý users
router.get('/manage', restrict.forUserNotAdmin, async (req, res) => {
    //Lấy ra những users không phải admin
    const rows = await userModel.allUserNotAdmin();
    res.render('vwAdmin/vwUserManager/manage', {
        users: rows,
    });
})

//Xử lý xóa 
router.post('/manage/:id/del', async (req, res) => {
    //Xóa người dùng trong bảng RequestUpdate, Downgrade, Bid, AutoBid, BlackList, Favorite (nếu có)
    const [result1, result2, result3, result6, result7, result8, result4] = await Promise.all([
        requestUpdateModel.delByUserID(req.params.id),
        downgradeModel.delByUserID(req.params.id),
        bidModel.delByUserID(req.params.id),
        autobidModel.del(req.params.id),
        blacklistModel.del(req.params.id),
        favoriteModel.del(req.params.id),
        productModel.allProductWithSellerID(req.params.id),
    ]);
    //Lấy ra các sản phẩm mà người bị xóa đã đăng
    if (result4.length > 0) {
        //Xóa tất cả những lần bid của các users khác về các sản phẩm mà người bị xóa đã đăng
        for (var i = 0; i < result4.length; i++) {
            const result9 = await bidModel.delByProID(result4[i].ProductID);
            //Xóa thư mục hình ảnh của các sản phẩm
            var FolderName = "./pictures/" + result4[i].ProductID.toString(10);
            const deletefiles = util.promisify(fs.unlink);
            for (var j = 1; j <= 3; j++) {
                await deletefiles(FolderName + "/" + j.toString(10) + "_main.png")
                    .then(() => console.log('Delete main success'))
                    .catch((err) => console.log(err));
                await deletefiles(FolderName + "/" + j.toString(10) + "_thumb.png")
                    .then(() => console.log('Delete thumb success'))
                    .catch((err) => console.log(err));
            }
            fs.rmdir(FolderName, (err) => {
                if (err) console.log(err);
                else console.log("Delete directory success");
            });
        }
    }
    //Nếu là seller thì xóa các sản phẩm mà seller đã đăng
    const result5 = await productModel.delBySellerID(req.params.id);

    //Xóa user trong db
    const rows = await userModel.delByID(req.params.id);
    req.flash('success_msg', 'Delete user success');
    res.redirect('/admin/user/manage');
})

//View profile user
router.get('/manage/:id/profile', restrict.forUserNotAdmin, async (req, res) => {
    //Lấy ra user có UserID
    const userID = req.params.id;
    const user = await userModel.singleByUserID(userID);
    user.DOB = moment(user.DOB).format("YYYY-MM-DD");
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
    const add = { UserID: "", Username: "", IsDown: "" };
    add.UserID = req.params.id;
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
    const result4 = await productModel.allProductWithSellerID(req.params.id);
    //Lấy ra các sản phẩm mà người bị hạ cấp đã đăng
    if (result4.length > 0) {
        //Xóa tất cả những lần bid của các users khác về các sản phẩm mà người bị hạ cấp đã đăng
        for (var i = 0; i < result4.length; i++) {
            const result9 = await bidModel.delByProID(result4[i].ProductID);
            //Xóa thư mục hình ảnh của các sản phẩm
            var FolderName = "./pictures/" + result4[i].ProductID.toString(10);
            const deletefiles = util.promisify(fs.unlink);
            for (var j = 1; j <= 3; j++) {
                await deletefiles(FolderName + "/" + j.toString(10) + "_main.png")
                    .then(() => console.log('Delete main success'))
                    .catch((err) => console.log(err));
                await deletefiles(FolderName + "/" + j.toString(10) + "_thumb.png")
                    .then(() => console.log('Delete thumb success'))
                    .catch((err) => console.log(err));
            }
            fs.rmdir(FolderName, (err) => {
                if (err) console.log(err);
                else console.log("Delete directory success");
            });
        }
    }
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