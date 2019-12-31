const express = require('express');
const productModel = require('../models/product.model');
const router = express.Router();
const userModel = require('../models/user.model');
const requestUpdateModel = require('../models/requestupdate.model');
const downgradeModel = require('../models/downgrade.model');

router.get('/', async (req, res) => {
    var thongbao;
    const [toend, popular, hprice] = await Promise.all([
        productModel.getTop5ToEnd(),
        productModel.getTop5PopularBid(),
        productModel.getTop5Price(),
    ]);

    if (req.session.authUser !== null || req.session.authUser !== undefined) {
        const [userup, userdown] = await Promise.all([
            requestUpdateModel.singleByUsername(req.session.authUser.Username),
            downgradeModel.singleByUsername(req.session.authUser.Username),
        ]);
        if (userup !== null) {
            //Xóa user khỏi bảng RequestUpdate
            if (+userup.IsRefuse !== -1) {
                const result = await requestUpdateModel.delByUsername(req.session.authUser.Username);
                if (+userup.IsRefuse === 0) {//Nếu duyệt cho lên seller
                    thongbao = 1;
                } else {//Nếu duyệt không cho lên seller
                    thongbao = 2;
                }
            }
        }
        if (userdown !== null) {
            const result = await downgradeModel.delByUsername(req.session.authUser.Username);
            if (+userdown.IsDown !== 0) {
                thongbao = 3;
            } 
        }
    }
    return res.render('vwHome/index', {
        top5ToEnd: toend[0],
        top5Popular: popular[0],
        top5Price: hprice[0],
        thongbao,
    });
});
module.exports = router;