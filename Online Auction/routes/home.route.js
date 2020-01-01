const express = require('express');
const productModel = require('../models/product.model');
const router = express.Router();
const userModel = require('../models/user.model');
const requestUpdateModel = require('../models/requestupdate.model');
const downgradeModel = require('../models/downgrade.model');

router.get('/', async (req, res) => {
    var thongbao = 0;
    const [toend, popular, hprice] = await Promise.all([
        productModel.getTop5ToEnd(),
        productModel.getTop5PopularBid(),
        productModel.getTop5Price(),
    ]);
    console.log(req.session.authUser);
    if (req.session.authUser !== undefined && req.session.authUser !== null) {
        const [userup, userdown] = await Promise.all([
            requestUpdateModel.singleByUsername(req.session.authUser.Username),
            downgradeModel.singleByUsername(req.session.authUser.Username),
        ]);
        //Nếu admin upgrade rồi downgrade trước khi user đó đăng nhập
        if (userup !== null && userdown !== null && userup.IsRefuse === 0 && userdown.IsDown === 1) {
            const result = await requestUpdateModel.delByUsername(req.session.authUser.Username);
            const result1 = await downgradeModel.delByUsername(req.session.authUser.Username);
            thongbao = 0;
        } else {
            //Nếu có trong bảng RequestUpdate
            if (userup !== null) {
                //Nếu admin đã duyệt cho bidder
                if (+userup.IsRefuse !== -1) {
                    //Xóa bidder đó khỏi bảng requestUpdate
                    const result = await requestUpdateModel.delByUsername(req.session.authUser.Username);
                    if (+userup.IsRefuse === 0) {//Nếu duyệt cho lên seller
                        thongbao = 1;
                    } else { //Nếu duyệt không cho lên seller
                        thongbao = 2;
                    }
                }
            }
            //Nếu có trong bảng Downgrade
            if (userdown !== null) {
                if (+userdown.IsDown !== 0) {
                    const result = await downgradeModel.delByUsername(req.session.authUser.Username);
                    thongbao = 3;
                }
            }
        }
    }
    return res.render('vwHome/index', {
        top5ToEnd: toend[0],
        top5Popular: popular[0],
        top5Price: hprice[0],
        thongbao: thongbao,
    });
});
module.exports = router;