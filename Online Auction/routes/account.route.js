const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const moment = require('moment');
const userModel = require('../models/user.model');
const restrict = require('../middlewares/auth.mdw');
const nodemailer = require('nodemailer');

//Register
router.get('/register', restrict.forUserSignIn, async (req, res) => {
    res.render('vwAccount/register');
});

router.post('/register', async (req, res) => {
    const { user_name, raw_password, confirm_password, first_name, last_name, user_email, user_dob, cityprovince, district, ward, street } = req.body;
    let error = [];

    //Kiểm tra các trường
    if (user_name == '' || raw_password == '' || confirm_password == '' ||
        first_name == '' || last_name == '' || user_email == '' ||
        user_dob == '' || cityprovince == '' || district == '' ||
        ward == '' || street == '') {
        error.push({ msg: 'Please fill in all fields' });
    }
    if (user_name != '')
        if (user_name.length < 4)
            error.push({ msg: 'Username should be at least 4 characters' });
    if (raw_password != '')
        if (raw_password.length < 4)
            error.push({ msg: 'Password should be at least 4 characters' });
    if (raw_password != confirm_password)
        error.push({ msg: 'Password do not match' });
    if (user_email != '')
        if (user_email.indexOf("@") == -1)
            error.push({ msg: 'Email invalidate' });
    //Kiểm tra trong db đã có user có username trùng không
    const [checkusername, checkemail] = await Promise.all([
        userModel.singleByUsername(user_name),
        userModel.singleByEmail(user_email)
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
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            service: 'gmail',
            auth: {
                user: 'hiendeptraiso1thegioi@gmail.com',
                pass: 'hiendeptraiqua'
            }
        });
        var mailOptions = {
            from: 'hiendeptraiso1thegioi@gmail.com',
            to: req.body.user_email,
            subject: 'OTP Code',
            text: 'You recieved message from ' + req.body.user_email,
            html: `<b>Your OTP is: ${otp}</b>`
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                return res.render('vwAccount/register');
            } else {
                console.log('Message sent: ' + info.response);
                req.session.info = req.body;
                req.session.OTP = otp;
                req.flash('success_msg', 'Please check your email and verify by OTP');
                return res.redirect('/account/verify');
            }
        });
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
        info.username = info.user_name;
        info.password = hash;
        info.firstname = info.first_name;
        info.lastname = info.last_name;
        info.email = info.user_email;
        info.dob = dob;
        info.type = 0;
        info.isUpgrade = 0;

        //Xóa những trường không cần thiết
        delete info.user_name;
        delete info.confirm_password;
        delete info.raw_password;
        delete info.first_name;
        delete info.last_name;
        delete info.user_email;
        delete info.user_dob;
        delete info.user_address;
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
    //So sánh có người dùng hay không
    const user = await userModel.singleByUsername(req.body.user_name);
    if (user === null) {//Nếu không có người dùng
        return res.render('vwAccount/signin', {
            err_message: 'That username is not registered',
            username: req.body.user_name
        });
    }
    //Nếu có người dùng
    //So sánh có đúng password hay không
    const rs = bcrypt.compareSync(req.body.password, user.password);
    if (rs === false) {//Nếu không đúng password
        return res.render('vwAccount/signin', {
            err_message: 'Password incorrect',
            username: req.body.user_name
        })
    }
    //Nếu đúng password render màn hình home
    delete user.password;
    req.session.isAuthenticated = true;
    req.session.authUser = user;
    const url = req.query.retUrl || '/';
    res.redirect(url);
});

//Sign out
router.post('/signout', (req, res) => {
    req.session.isAuthenticated = false;
    req.session.authUser = null;
    res.redirect(req.headers.referer);
})


//View profile
router.get('/profile', restrict.forUserNotSignIn, restrict.forAdmin, (req, res) => {
    res.render('vwAccount/profile');
})

router.get('/profile/edit/username', restrict.forUserNotSignIn, (req, res) => {
    res.render('vwAccount/changeusername')
})

router.post('/profile/edit/username', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra các trường có trống hay không
    if (req.body.username === '') {
        return res.render('vwAccount/changeusername', {
            error: 'Please fill in all fields'
        });
    }
    //Kiểm tra các trường có nhỏ hơn 4 ký tự hay không
    if (req.body.username.length < 4) {
        return res.render('vwAccount/changeusername', {
            error: 'Username must have at least 4 characters'
        });
    }
    //Nếu thỏa đk trên
    //So sánh có người dùng với username nhập vào hay không
    const user = await userModel.singleByUsername(req.body.username);
    if (user === null) {//Nếu không có người dùng
        const result = await userModel.patch(req.body, req.session.authUser.username);
        req.session.authUser.username = req.body.username;
        req.flash('success_msg', 'Changing username complete');
        res.redirect('/account/profile');
    } else {
        // console.log(user === null);
        res.render('vwAccount/changeusername', {
            error: 'Username has already been used',
            name: req.body.username
        });
    }
});


//Change password
router.get('/profile/edit/password', restrict.forUserNotSignIn, (req, res) => {
    res.render('vwAccount/changepassword')
})

router.post('/profile/edit/password', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra các trường có trống hay không
    if (req.body.oldpassword === '' || req.body.newpassword === '' || req.body.confirmpassword === '') {
        return res.render('vwAccount/changepassword', {
            error: 'Please fill in all fields'
        });
    }
    //Kiểm tra 2 trường newpassword và confirmpassword có nhỏ hơn 4 ký tự hay không
    if (req.body.newpassword.length < 4) {
        return res.render('vwAccount/changepassword', {
            error: 'New password must have at least 4 characters'
        });
    }
    if (req.body.confirmpassword.length < 4) {
        return res.render('vwAccount/changepassword', {
            error: 'Confirm password must have at least 4 characters'
        });
    }
    //Nếu thỏa đk trên
    //Lấy ra người dùng
    const user = await userModel.singleByEmail(req.session.authUser.email);
    //So sánh oldpassword có đúng hay không
    const rs = bcrypt.compareSync(req.body.oldpassword, user.password);
    if (rs === false) {//Nếu không đúng password
        return res.render('vwAccount/changepassword', {
            error: 'OldPassword incorrect'
        })
    } else {//Nếu oldpassword đúng
        //So sánh nếu không ko match password
        if (req.body.newpassword === req.body.confirmpassword) {//Nếu match
            const N = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.newpassword, N);
            req.body.password = hash;
            delete req.body.oldpassword;
            delete req.body.newpassword;
            delete req.body.confirmpassword;
            const result = await userModel.patch(req.body, req.session.authUser.username);
            req.flash('success_msg', 'Changing password complete');
            res.redirect('/account/profile');
        } else {//Nếu không match
            res.render('vwAccount/changepassword', {
                error: 'New Password and Confirm New Password not match',
            });
        }
    }
});

//Change email
router.get('/profile/edit/email', restrict.forUserNotSignIn, (req, res) => {
    res.render('vwAccount/changeemail')
})

router.post('/profile/edit/email', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra các trường có trống hay không
    if (req.body.email === '') {
        return res.render('vwAccount/changeemail', {
            error: 'Please fill in all fields'
        });
    }
    //Kiểm tra email nhập vào có đúng định dạng không
    if (req.body.email.indexOf("@") == -1) {
        return res.render('vwAccount/changeemail', {
            error: 'Email invalidate'
        });
    }
    //So sánh có người dùng với email nhập vào hay không
    const user = await userModel.singleByEmail(req.body.email);
    if (user === null) {//Nếu không có người dùng
        const result = await userModel.patch(req.body, req.session.authUser.username);
        req.session.authUser.email = req.body.email;
        req.flash('success_msg', 'Changing email complete');
        res.redirect('/account/profile');
    } else {//Nếu email đã tồn tại
        res.render('vwAccount/changeemail', {
            error: 'Email has already been used',
            name: req.body.username
        });
    }
});


//Change firstname
router.get('/profile/edit/firstname', restrict.forUserNotSignIn, (req, res) => {
    res.render('vwAccount/changefirstname')
})

router.post('/profile/edit/firstname', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra các trường có trống hay không
    if (req.body.firstname === '') {
        return res.render('vwAccount/changefirstname', {
            error: 'Please fill in all fields'
        });
    }
    //Nếu thỏa các đk trên
    const result = await userModel.patch(req.body, req.session.authUser.username);
    req.session.authUser.firstname = req.body.firstname;
    req.flash('success_msg', 'Changing firstname complete');
    res.redirect('/account/profile');
});

//Change lastname
router.get('/profile/edit/lastname', restrict.forUserNotSignIn, (req, res) => {
    res.render('vwAccount/changelastname')
})

router.post('/profile/edit/lastname', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra các trường có trống hay không
    if (req.body.lastname === '') {
        return res.render('vwAccount/changelastname', {
            error: 'Please fill in all fields'
        });
    }
    //Nếu thỏa các đk trên
    const result = await userModel.patch(req.body, req.session.authUser.username);
    req.session.authUser.lastname = req.body.lastname;
    req.flash('success_msg', 'Changing lastname complete');
    res.redirect('/account/profile');
});

//Change dob
router.get('/profile/edit/dob', restrict.forUserNotSignIn, (req, res) => {
    res.render('vwAccount/changedob')
})

router.post('/profile/edit/dob', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra các trường có trống hay không
    console.log(req.body.dob);
    if (req.body.dob === '') {
        return res.render('vwAccount/changedob', {
            error: 'Please fill in all fields'
        });
    }
    //Nếu thỏa các đk trên
    const dob = moment(req.body.dob, 'DD/MM/YYYY').format('YYYY-MM-DD');
    req.body.dob = dob;
    const result = await userModel.patch(req.body, req.session.authUser.username);
    req.session.authUser.dob = dob;
    req.flash('success_msg', 'Changing dob complete');
    res.redirect('/account/profile');
});

//Change cityprovince
router.get('/profile/edit/cityprovince', restrict.forUserNotSignIn, (req, res) => {
    res.render('vwAccount/changecityprovince')
})

router.post('/profile/edit/cityprovince', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra các trường có trống hay không
    if (req.body.cityprovince === '') {
        return res.render('vwAccount/cityprovince', {
            error: 'Please fill in all fields'
        });
    }
    //Nếu thỏa các đk trên
    const result = await userModel.patch(req.body, req.session.authUser.username);
    req.session.authUser.cityprovince = req.body.cityprovince;
    req.flash('success_msg', 'Changing cityprovince complete');
    res.redirect('/account/profile');
});

//Change district
router.get('/profile/edit/district', restrict.forUserNotSignIn, (req, res) => {
    res.render('vwAccount/changedistrict')
})

router.post('/profile/edit/district', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra các trường có trống hay không
    if (req.body.district === '') {
        return res.render('vwAccount/changedistrict', {
            error: 'Please fill in all fields'
        });
    }
    //Nếu thỏa các đk trên
    const result = await userModel.patch(req.body, req.session.authUser.username);
    req.session.authUser.district = req.body.district;
    req.flash('success_msg', 'Changing district complete');
    res.redirect('/account/profile');
});

//Change ward
router.get('/profile/edit/ward', restrict.forUserNotSignIn, (req, res) => {
    res.render('vwAccount/changeward')
})

router.post('/profile/edit/ward', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra các trường có trống hay không
    if (req.body.ward === '') {
        return res.render('vwAccount/changeward', {
            error: 'Please fill in all fields'
        });
    }
    //Nếu thỏa các đk trên
    const result = await userModel.patch(req.body, req.session.authUser.username);
    req.session.authUser.ward = req.body.ward;
    req.flash('success_msg', 'Changing ward complete');
    res.redirect('/account/profile');
});

//Change street
router.get('/profile/edit/street', restrict.forUserNotSignIn, (req, res) => {
    res.render('vwAccount/changestreet')
})

router.post('/profile/edit/street', restrict.forUserNotSignIn, async (req, res) => {
    //Kiểm tra các trường có trống hay không
    if (req.body.street === '') {
        return res.render('vwAccount/changestreet', {
            error: 'Please fill in all fields'
        });
    }
    //Nếu thỏa các đk trên
    const result = await userModel.patch(req.body, req.session.authUser.username);
    req.session.authUser.street = req.body.street;
    req.flash('success_msg', 'Changing street complete');
    res.redirect('/account/profile');
});

//Forgot password
router.get('/forgotpassword', (req, res) => {
    res.render('vwAccount/forgotpassword')
})

router.post('/forgotpassword', async (req, res) => {
    //Kiểm tra email nhập vào có trống hay không
    if (req.body.email === '') {
        return res.render('vwAccount/forgotpassword', {
            error: 'Please fill in all fields'
        });
    }
    //So sánh có người dùng hay không
    const user = await userModel.singleByEmail(req.body.email);
    if (user === null) {//Nếu không có người dùng
        return res.render('vwAccount/forgotpassword', {
            error: 'That email is not registered',
            email: req.body.email
        });
    } else {//Nếu có người dùng
        //Gửi email OTP xác nhận
        const otp = Math.floor(Math.random() * 1001);
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            service: 'gmail',
            auth: {
                user: 'hiendeptraiso1thegioi@gmail.com',
                pass: 'hiendeptraiqua'
            }
        });
        var mailOptions = {
            from: 'hiendeptraiso1thegioi@gmail.com',
            to: req.body.email,
            subject: 'OTP Code',
            text: 'You recieved message from ' + req.body.email,
            html: `<b>Your OTP is: ${otp}</b>`
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                return res.render('vwAccount/forgotpassword');
            } else {
                console.log('Message sent: ' + info.response);
                req.session.OTP1 = otp;
                req.session.email = req.body.email;
                req.flash('success_msg', 'Please check your email for OTP');
                return res.redirect('/account/forgotpassword/otp');
            }
        });
    }
});

//OTP forgotpassword
router.get('/forgotpassword/otp', restrict.forGuestNotEnterEmailRecovery, (req, res) => {
    res.render('vwAccount/otpforgotpassword')
})

router.post('/forgotpassword/otp', async (req, res) => {
    //Kiểm tra OTP nhập vào có trống hay không
    if (req.body.OTP === '') {
        return res.render('vwAccount/otpforgotpassword', {
            error: 'Please fill in all fields'
        });
    }
    //Kiểm tra nếu OTP nhập vào có đúng không
    if (+req.body.OTP === +req.session.OTP1) {//Đúng
        req.session.OTP1 = null;
        req.session.isTrueOTP = true;
        res.redirect('/account/forgotpassword/newpassword');
    } else {//Không đúng
        res.render('vwAccount/otpforgotpassword', {
            error: 'Wrong OTP'
        });
    }
});

//New password 
router.get('/forgotpassword/newpassword', restrict.forGuestNotEnterOTP, (req, res) => {
    res.render('vwAccount/newpassword')
})

router.post('/forgotpassword/newpassword', async (req, res) => {
    //Kiểm tra các trường có trống hay không
    if (req.body.newpassword === '' || req.body.confirmpassword === '') {
        return res.render('vwAccount/newpassword', {
            error: 'Please fill in all fields'
        });
    }
    //Kiểm tra 2 trường newpassword và confirmpassword có nhỏ hơn 4 ký tự hay không
    if (req.body.newpassword.length < 4) {
        return res.render('vwAccount/newpassword', {
            error: 'New password must have at least 4 characters'
        });
    }
    if (req.body.confirmpassword.length < 4) {
        return res.render('vwAccount/newpassword', {
            error: 'Confirm password must have at least 4 characters'
        });
    }
    //Kiểm tra 2 password có match hay không
    if (req.body.newpassword === req.body.confirmpassword) {//Nếu match
        const N = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.newpassword, N);
        req.body.password = hash;
        delete req.body.newpassword;
        delete req.body.confirmpassword;
        const user = await userModel.singleByEmail(req.session.email);
        const result = await userModel.patch(req.body, user.username);
        //Xóa các session
        req.session.email = null;
        req.session.isTrueOTP = null;
        req.flash('success_msg', 'Changing password complete');
        res.redirect('/account/signin');
    } else {//Nếu không match
        res.render('vwAccount/newpassword', {
            error: 'New Password and Confirm New Password not match',
        });
    }
});


//Upgrade to seller
router.post('/profile/upgrade', async (req, res) => {
    //Set thông tin của user là muốn upgrade lên thành seller
    req.session.authUser.isUpgrade = 1;
    //Ghi thông tin vào database
    const isupgrade = { isUpgrade: req.session.authUser.isUpgrade };
    const result = await userModel.patch(isupgrade, req.session.authUser.username);
    req.flash('success_msg', 'Your request has been sent');
    res.redirect('/account/profile');
})

module.exports = router;