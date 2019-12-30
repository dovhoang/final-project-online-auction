const express = require('express');
const productModel = require('../models/product.model');
const router = express.Router();
const userModel = require('../models/user.model');
const requestUpdateModel = require('../models/requestupdate.model');
const downgradeModel = require('../models/downgrade.model');

router.get('/', async (req, res) => {
    if (req.session.authUser === null || req.session.authUser === undefined) {
        const [toend, popular, hprice] = await Promise.all([
            productModel.getTop5ToEnd(),
            productModel.getTop5PopularBid(),
            productModel.getTop5Price(),
        ]);
        return res.render('vwHome/index', {
            top5ToEnd: toend[0],
            top5Popular: popular[0],
            top5Price: hprice[0],
        });
    } else {
        const [toend, popular, hprice, user1, user2] = await Promise.all([
            productModel.getTop5ToEnd(),
            productModel.getTop5PopularBid(),
            productModel.getTop5Price(),
            requestUpdateModel.singleByUsername(req.session.authUser.Username),
            downgradeModel.singleByUsername(req.session.authUser.Username),
        ]);

        //Khi không có gì

        if ((user1 === null && user2 === null)) {
            //Xóa user khỏi 2 bảng
            const [result1, result2] = await Promise.all([
                requestUpdateModel.delByUsername(req.session.authUser.Username),
                downgradeModel.delByUsername(req.session.authUser.Username)
            ]);
            return res.render('vwHome/index', {
                top5ToEnd: toend[0],
                top5Popular: popular[0],
                top5Price: hprice[0],
            });
        }
        if (user1 !== null && user2 !== null) {
            //Khi admin nâng cấp lên rồi hạ cấp xuống ngay trước khi người dùng đăng nhập vào
            if ((+user1.IsRefuse === 0 && +user2.IsDown === 1)) {
                //Xóa user khỏi 2 bảng
                const [result1, result2] = await Promise.all([
                    requestUpdateModel.del(req.session.authUser.Username),
                    downgradeModel.del(req.session.authUser.Username)
                ]);
                return res.render('vwHome/index', {
                    top5ToEnd: toend[0],
                    top5Popular: popular[0],
                    top5Price: hprice[0],
                });
            }
        }

        //Nếu người dùng có trong bảng RequestUpdate
        if (user1 !== null) {
            //Nếu admin chưa duyệt thì không báo gì cả
            console.log(+user1.IsRefuse === -1);
            if (+user1.IsRefuse === -1) {
                return res.render('vwHome/index', {
                    top5ToEnd: toend[0],
                    top5Popular: popular[0],
                    top5Price: hprice[0],
                });
            } else {//Nếu admin đã duyệt
                //Xóa user khỏi bảng RequestUpdate
                console.log("Xóa user khỏi bảng");
                const result = await requestUpdateModel.delByUsername(req.session.authUser.Username);
                if (+user1.IsRefuse === 0) {//Nếu duyệt cho lên seller
                    return res.render('vwHome/index', {
                        top5ToEnd: toend[0],
                        top5Popular: popular[0],
                        top5Price: hprice[0],
                        thongbao: 1
                    });
                } else {//Nếu duyệt không cho lên seller
                    return res.render('vwHome/index', {
                        top5ToEnd: toend[0],
                        top5Popular: popular[0],
                        top5Price: hprice[0],
                        thongbao: 2
                    });
                }
            }
        }

        //Nếu người dùng có trong bảng Downgrade
        if (user2 !== null) {
            //Nếu admin chưa duyệt thì không báo gì cả
            console.log("IsDown: ", +user2.IsDown === 0);
            if (+user2.IsDown === 0) {
                return res.render('vwHome/index', {
                    top5ToEnd: toend[0],
                    top5Popular: popular[0],
                    top5Price: hprice[0],
                });
            } else {//Nếu admin duyệt xuống
                //Xóa user khỏi bảng Downgrade
                const result = await downgradeModel.delByUsername(req.session.authUser.Username);
                return res.render('vwHome/index', {
                    top5ToEnd: toend[0],
                    top5Popular: popular[0],
                    top5Price: hprice[0],
                    thongbao: 3
                });
            }
        }
    }
});
module.exports = router;