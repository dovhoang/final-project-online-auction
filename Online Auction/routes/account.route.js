const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const moment = require('moment');
const userModel = require('../models/user.model');
const bidModel =require('../models/bid.model');
const requestUpdateModel = require('../models/requestupdate.model');
const restrict = require('../middlewares/auth.mdw');
const request = require('request');
const helper = require('../helper/helper');

//Register
router.get('/register', restrict.forUserSignIn, async (req, res) => {
    res.render('vwAccount/register');
});


router.post('/register', async (req, res) => {
    let error = [];
    //Kiểm tra captcha
    if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
        return res.render('vwAccount/register', {
            error_msg: "Please select captcha"
        });
    }
    const secretKey = "6LdiUsgUAAAAAGMzB2NaH25P6HidWvJR9XHW_7kz";

    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

    request(verificationURL, function (error, response, body) {
        body = JSON.parse(body);

        if (body.success !== undefined && !body.success) {
            return res.render('vwAccount/register', {
                error_msg: "Failed captcha verification"
            });
        }
    });
    //Chạy được xuống đây là captcha thành công
    //Kiểm tra trong db đã có user có username trùng không
    const [checkusername, checkemail] = await Promise.all([
        userModel.singleByUsername(req.body.user_name),
        userModel.singleByEmail(req.body.user_email)
    ]);

    if (checkusername != null)
        error.push({ msg: 'Username is already registered' });
    if (checkemail != null)
        error.push({ msg: 'Email is already registered' });

    if (error.length > 0) {//Nếu có lỗi
        let fields = req.body;
        res.render('vwAccount/register', {
            error,
            fields,
        });
    } else {//Nếu không có lỗi
        const otp = Math.floor(Math.random() * 1001);
        //Gửi email xác nhận
        const result = helper.sendMail(req.body.user_email, 'OTP Code', `<b>Your OTP is: ${otp}</b>`);
        //Nếu gửi mail lỗi
        if (result === false) {
            return res.render('vwAccount/register');
        } else { // Nếu gửi mail ok
            req.session.info = req.body;
            req.session.OTP = otp;
            req.flash('success_msg', 'Please check your email and verify by OTP');
            // req.flash('otp', otp);
            return res.redirect('/account/verify');
        }
    }
});

//Verify OTP
router.get('/verify', restrict.forUserSignIn, restrict.forGuestNotEnterRegisterForm, (req, res) => {
    res.render('vwAccount/verify');
})

router.post('/verify', async (req, res) => {
    const info = req.session.info;
    if (+req.body.OTP === +req.session.OTP) {
        const N = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(info.raw_password, N);
        const dob = moment(info.user_dob, 'DD/MM/YYYY').format('YYYY-MM-DD');

        //Thiết lập các trường cần thiết
        info.Username = info.user_name;
        info.Password = hash;
        info.FirstName = info.first_name;
        info.LastName = info.last_name;
        info.Email = info.user_email;
        info.DOB = dob;
        info.Type = 0;
        info.RatingUp = 1;

        //Xóa những trường không cần thiết
        delete info.user_name;
        delete info.confirm_password;
        delete info.raw_password;
        delete info.first_name;
        delete info.last_name;
        delete info.user_email;
        delete info.user_dob;
        delete info.user_address;
        delete info['g-recaptcha-response'];
        //Thêm user vào bảng và render trang login  
        const result = await userModel.add(info);
        req.session.info = null;
        req.session.OTP = null;
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/account/signin');
    } else {
        res.render('vwAccount/verify', {
            isWrongOTP: true,
        })
    }
})


//Sign in
router.get('/signin', restrict.forUserSignIn, async (req, res) => {
    res.render('vwAccount/signin');
})

router.post('/signin', async (req, res) => {

    const [user1, user2, user3] = await Promise.all([
        userModel.singleByUsername(req.body.username),
        requestUpdateModel.singleWithCondition(req.body.username),
        requestUpdateModel.singleWithCondition2(req.body.username),
    ]);
    //So sánh có người dùng hay không
    if (user1 === null) {//Nếu không có người dùng
        return res.render('vwAccount/signin', {
            err_message: 'That username is not registered',
            username: req.body.username
        });
    }
    //Nếu có người dùng
    //So sánh có đúng password hay không
    const rs = bcrypt.compareSync(req.body.password, user1.Password);
    if (rs === false) {//Nếu không đúng password
        return res.render('vwAccount/signin', {
            err_message: 'Password incorrect',
            username: req.body.username
        })
    }
    //Nếu đúng password render màn hình home
    delete user1.Password;
    req.session.isAuthenticated = true;
    req.session.authUser = user1;
    req.session.authUser.DOB = moment(req.session.authUser.DOB).format("YYYY-MM-DD");
    if (user2 === null)
        req.session.authUser.IsUpgrade = 0;
    else req.session.authUser.IsUpgrade = 1;
    if (user3 !== null) {
        res.redirect('/');
    } else {
        const url = req.query.retUrl || '/';
        req.flash('signinsuccess', true);
        res.redirect(url);
    }
});

//Sign out
router.post('/signout', (req, res) => {
    req.session.isAuthenticated = false;
    req.session.authUser = null;
    req.flash('signoutsuccess', true);
    // res.redirect(req.headers.referer);
    res.redirect('/');
})


//View profile
router.get('/profile', restrict.forUserNotSignIn, restrict.forAdmin, async(req, res) => {
    const score = await bidModel.getScore(req.session.authUser.UserID);
    score[0].score=score[0].score*100;
    res.render('vwAccount/profile', {
        infoReview: score
    });
})

router.get('/profile/edit/username', restrict.forUserNotSignIn, restrict.forAdmin, (req, res) => {
    res.render('vwAccount/changeusername')
})

router.post('/profile/edit/username', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra password có khớp hay không
    const user1 = await userModel.singleByUsername(req.session.authUser.Username);
    const rs = bcrypt.compareSync(req.body.password, user1.Password);
    if (rs === false) {//Nếu không đúng password
        return res.render('vwAccount/changeusername', {
            error: 'Password incorrect'
        });
    }
    //Nếu thỏa đk trên
    //So sánh có người dùng với username nhập vào hay không
    const user = await userModel.singleByUsername(req.body.username);
    if (user === null) {//Nếu không có người dùng
        delete req.body.password;
        const result = await userModel.patch(req.body, req.session.authUser.Username);
        req.session.authUser.Username = req.body.username;
        req.flash('success_msg', 'Change username success');
        res.redirect('/account/profile');
    } else {
        res.render('vwAccount/changeusername', {
            error: 'Username has already been used',
            name: req.body.username
        });
    }
});


//Change password
router.get('/profile/edit/password', restrict.forUserNotSignIn, restrict.forAdmin, (req, res) => {
    res.render('vwAccount/changepassword')
})

router.post('/profile/edit/password', restrict.forUserNotSignIn, async (req, res) => {
    //Lấy ra người dùng
    const user = await userModel.singleByEmail(req.session.authUser.Email);
    //So sánh oldpassword có đúng hay không
    const rs = bcrypt.compareSync(req.body.oldpassword, user.Password);
    if (rs === false) {//Nếu không đúng password
        return res.render('vwAccount/changepassword', {
            error: 'OldPassword incorrect'
        })
    } else {//Nếu oldpassword đúng
        delete req.body.password;
        const N = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.newpassword, N);
        req.body.password = hash;
        delete req.body.oldpassword;
        delete req.body.newpassword;
        delete req.body.confirmpassword;
        const result = await userModel.patch(req.body, req.session.authUser.Username);
        req.flash('success_msg', 'Change password success');
        res.redirect('/account/profile');
    }
});

//Change email
router.get('/profile/edit/email', restrict.forUserNotSignIn, restrict.forAdmin, (req, res) => {
    res.render('vwAccount/changeemail')
})

router.post('/profile/edit/email', restrict.forUserNotSignIn, async (req, res) => {
    //So sánh password nhập vào có đúng hay không
    const user1 = await userModel.singleByEmail(req.session.authUser.Email);
    const rs = bcrypt.compareSync(req.body.password, user1.Password);
    if (rs === true) {//Nếu đúng
        //So sánh có người dùng với email nhập vào hay không
        const user = await userModel.singleByEmail(req.body.email);
        if (user === null) {//Nếu không có người dùng
            const email = { Email: req.body.email };
            const result = await userModel.patch(email, req.session.authUser.Username);
            req.session.authUser.Email = req.body.email;
            req.flash('success_msg', 'Change email success');
            res.redirect('/account/profile');
        } else {//Nếu email đã tồn tại
            res.render('vwAccount/changeemail', {
                error: 'Email has already been used'
            });
        }
    } else {//Nếu không
        res.render('vwAccount/changeemail', {
            error: 'Password incorrect'
        });
    }
});


//Change firstname
router.get('/profile/edit/firstname', restrict.forUserNotSignIn, restrict.forAdmin, (req, res) => {
    res.render('vwAccount/changefirstname')
})

router.post('/profile/edit/firstname', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra password có khớp hay không
    const user = await userModel.singleByUsername(req.session.authUser.Username);
    const rs = bcrypt.compareSync(req.body.password, user.Password);
    if (rs === false) {//Nếu không đúng password
        return res.render('vwAccount/changefirstname', {
            error: 'Password incorrect'
        });
    }
    //Nếu thỏa các đk trên
    delete req.body.password;
    const result = await userModel.patch(req.body, req.session.authUser.Username);
    req.session.authUser.FirstName = req.body.firstname;
    req.flash('success_msg', 'Change firstname success');
    res.redirect('/account/profile');
});

//Change lastname
router.get('/profile/edit/lastname', restrict.forUserNotSignIn, restrict.forAdmin, (req, res) => {
    res.render('vwAccount/changelastname')
})

router.post('/profile/edit/lastname', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra password có khớp hay không
    const user = await userModel.singleByUsername(req.session.authUser.Username);
    const rs = bcrypt.compareSync(req.body.password, user.Password);
    if (rs === false) {//Nếu không đúng password
        return res.render('vwAccount/changelastname', {
            error: 'Password incorrect'
        });
    }
    //Nếu thỏa các đk trên
    delete req.body.password;
    const result = await userModel.patch(req.body, req.session.authUser.Username);
    req.session.authUser.LastName = req.body.lastname;
    req.flash('success_msg', 'Change lastname success');
    res.redirect('/account/profile');
});

//Change dob
router.get('/profile/edit/dob', restrict.forUserNotSignIn, restrict.forAdmin, (req, res) => {
    res.render('vwAccount/changedob')
})

router.post('/profile/edit/dob', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra password có khớp hay không
    const user = await userModel.singleByUsername(req.session.authUser.Username);
    const rs = bcrypt.compareSync(req.body.password, user.Password);
    if (rs === false) {//Nếu không đúng password
        return res.render('vwAccount/changedob', {
            error: 'Password incorrect'
        });
    }
    //Nếu thỏa các đk trên
    delete req.body.password;
    const dob = moment(req.body.dob, 'DD/MM/YYYY').format('YYYY-MM-DD');
    req.body.dob = dob;
    const result = await userModel.patch(req.body, req.session.authUser.Username);
    req.session.authUser.DOB = dob;
    req.flash('success_msg', 'Change dob success');
    res.redirect('/account/profile');
});

//Change cityprovince
router.get('/profile/edit/cityprovince', restrict.forUserNotSignIn, restrict.forAdmin, (req, res) => {
    res.render('vwAccount/changecityprovince')
})

router.post('/profile/edit/cityprovince', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra password có khớp hay không
    const user = await userModel.singleByUsername(req.session.authUser.Username);
    const rs = bcrypt.compareSync(req.body.password, user.Password);
    if (rs === false) {//Nếu không đúng password
        return res.render('vwAccount/changecityprovince', {
            error: 'Password incorrect'
        });
    }
    //Nếu thỏa các đk trên
    delete req.body.password;
    const result = await userModel.patch(req.body, req.session.authUser.Username);
    req.session.authUser.CityProvince = req.body.cityprovince;
    req.flash('success_msg', 'Change cityprovince success');
    res.redirect('/account/profile');
});

//Change district
router.get('/profile/edit/district', restrict.forUserNotSignIn, restrict.forAdmin, (req, res) => {
    res.render('vwAccount/changedistrict')
})

router.post('/profile/edit/district', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra password có khớp hay không
    const user = await userModel.singleByUsername(req.session.authUser.Username);
    const rs = bcrypt.compareSync(req.body.password, user.Password);
    if (rs === false) {//Nếu không đúng password
        return res.render('vwAccount/changedistrict', {
            error: 'Password incorrect'
        });
    }
    //Nếu thỏa các đk trên
    delete req.body.password;
    const result = await userModel.patch(req.body, req.session.authUser.Username);
    req.session.authUser.District = req.body.district;
    req.flash('success_msg', 'Change district success');
    res.redirect('/account/profile');
});

//Change ward
router.get('/profile/edit/ward', restrict.forUserNotSignIn, restrict.forAdmin, (req, res) => {
    res.render('vwAccount/changeward')
})

router.post('/profile/edit/ward', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra password có khớp hay không
    const user = await userModel.singleByUsername(req.session.authUser.Username);
    const rs = bcrypt.compareSync(req.body.password, user.Password);
    if (rs === false) {//Nếu không đúng password
        return res.render('vwAccount/changeward', {
            error: 'Password incorrect'
        });
    }
    //Nếu thỏa các đk trên
    delete req.body.password;
    const result = await userModel.patch(req.body, req.session.authUser.Username);
    req.session.authUser.Ward = req.body.ward;
    req.flash('success_msg', 'Change ward success');
    res.redirect('/account/profile');
});

//Change street
router.get('/profile/edit/street', restrict.forUserNotSignIn, restrict.forAdmin, (req, res) => {
    res.render('vwAccount/changestreet')
})

router.post('/profile/edit/street', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra password có khớp hay không
    const user = await userModel.singleByUsername(req.session.authUser.Username);
    const rs = bcrypt.compareSync(req.body.password, user.Password);
    if (rs === false) {//Nếu không đúng password
        return res.render('vwAccount/changestreet', {
            error: 'Password incorrect'
        });
    }
    //Nếu thỏa các đk trên
    delete req.body.password;
    const result = await userModel.patch(req.body, req.session.authUser.Username);
    req.session.authUser.Street = req.body.street;
    req.flash('success_msg', 'Change street success');
    res.redirect('/account/profile');
});


//Upgrade to seller
router.post('/profile/upgrade', async (req, res) => {
    var info = { Username: "", UserID: "", IsRefuse: "" };
    info.Username = req.session.authUser.Username;
    info.UserID = req.session.authUser.UserID;
    info.IsRefuse = -1;
    //Ghi thông tin user vào bảng RequestUpdate
    const result = await requestUpdateModel.add(info);
    req.session.authUser.IsUpgrade = 1;
    req.flash('success_msg', 'Your request has been sent');
    res.redirect('/account/profile');
});

module.exports = router;