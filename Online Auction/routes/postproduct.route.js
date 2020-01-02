const express = require('express');
const router = express.Router();
const productModel = require('../models/product.model');
const restrict = require('../middlewares/auth.mdw');
const path = require('path');
const fs = require('fs');
var multer = require('multer');
const sharp = require('sharp');
const moment = require('moment');

var FolderName = "./pictures/";
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, FolderName)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})
function RenameFile(filetorename, renamefile) {
    fs.renameSync(filetorename, renamefile);
}

function SharpLargeImages(fileinput, fileoutput) {
    sharp(fileinput)
        .resize(500, 500)
        .toFile(fileoutput, function (err) {
            if (err) console.log(err)
            else console.log("Resize success");
        });
}

function SharpSmallImages(fileinput, fileoutput) {
    sharp(fileinput)
        .resize(132, 132)
        .toFile(fileoutput, function (err) {
            if (err) console.log(err)
            else console.log("Resize success");
        });
}

function DeleteFileTemp(fileinput) {
    //Xóa file temp
    fs.unlinkSync(fileinput);
}

var upload = multer({ storage: storage })

router.get('/', restrict.forUserNotSeller, (req, res) => {
    res.render('vwPostProduct/postproduct');
})

router.post('/', async (req, res) => {
    //Lấy ra proID lớn nhất
    const result = await productModel.getLargestProID();
    var proId = +result[0].ProId;
    proId++;

    //Xác định folder chứa hình ảnh upload
    FolderName = "./pictures/" + proId.toString(10);

    //Tạo thư mục /pictures/proId
    fs.mkdir(FolderName, (err) => {
        if (err) console.log(err);
        else console.log("Create directory success");
    })

    //Upload ảnh vào thư mục FolderName
    upload.array('Picture', 3)(req, res, async err => {
        if (err) {//Nếu lỗi
            res.render('vwPostProduct/postproduct', {
                error: 'Error while uploading images'
            });
        } else {//Nếu OK
            //Nếu upload không đúng 3 hình
            if (req.files.length !== 3) {
                //Xóa thư mục /pictures/proId
                fs.unlink(FolderName, (err) => {
                    if (err) console.log(err);
                    else console.log("Delete directory success");
                });
                return res.render('vwPostProduct/postproduct', {
                    error: 'Please put in exactly 3 images'
                });
            }
            //Ok 3 ảnh
            //Đổi tên các bức ảnh
            for (var i = 1; i <= req.files.length; i++) {
                //3 file người dùng nhập vào rename thành temp
                //từ 3 file temp này sharp ra 6 tấm ảnh (3 lớn 3 nhỏ)
                const result = RenameFile(FolderName + "/" + req.files[i - 1].originalname, FolderName + "/" + i.toString(10) + "_temps" +
                    path.extname(req.files[i - 1].originalname));
                //Sharp 3 lớn
                const result1 = SharpLargeImages(FolderName + "/" + i.toString(10) + "_temps" +
                    path.extname(req.files[i - 1].originalname), FolderName + "/" + i.toString(10) + "_main.png");
                //Sharp 3 nhỏ
                const result2 = SharpSmallImages(FolderName + "/" + i.toString(10) + "_temps" +
                    path.extname(req.files[i - 1].originalname), FolderName + "/" + i.toString(10) + "_thumbs.png");
                //Xóa file temp dưới chỗ này thì lỗi vì tài nguyên bận
            }
            var timeexpired = moment();
            timeexpired.set('date', timeexpired.get('date') + 7);
            //Ghi product vào db
            const product = {
                ProductID: proId,
                ProductName: req.body.ProductName,
                CatId: req.body.Categories,
                SellerID: req.session.authUser.UserID,
                PriceStart: req.body.PriceStart,
                PricePurchase: req.body.PricePurchase,
                PriceStep: req.body.PriceStep,
                Description: '<b><i class="fa fa-edit"></i> ' + moment().format('YYYY-MM-DD HH:mm:ss') + "</b><br>" + req.body.Description,
                TimePost: moment().format('YYYY-MM-DD HH:mm:ss'),
                TimeExp: timeexpired.format('YYYY-MM-DD HH:mm:ss'),
            }
            const result = await productModel.add(product);
            for (var i = 1; i <= req.files.length; i++) {
                const result3 = DeleteFileTemp(FolderName + "/" + i.toString(10) + "_temps" +
                    path.extname(req.files[i - 1].originalname));
            }

            res.render('vwPostProduct/postproduct', {
                success: 'Your product was successfully posted'
            });
        }
    });
})

router.get('/:id/update', restrict.forUserNotSignIn, async (req, res) => {
    const product = await productModel.singleByProID(req.params.id);
    //Nếu sản phẩm đó không phải là do người đang đăng nhập đăng thì về home
    if (product.SellerID !== req.session.authUser.UserID) {
        return res.redirect('/');
    }
    res.render('vwPostProduct/updatedescription', {
        product
    });
})

router.post('/:id/update', async (req, res) => {
    const product = await productModel.singleByProID(req.params.id);
    const entity = {
        ProID: req.params.id, Description: product.Description + "<br>" +
            '<b><i class="fa fa-edit"></i> ' + moment().format('YYYY-MM-DD HH:mm:ss') + "</b><br>" + req.body.Description
    };
    const result = await productModel.patch(entity);
    req.flash('success_msg', 'Append description success');
    res.redirect('/allpostproduct');
})

module.exports = router;