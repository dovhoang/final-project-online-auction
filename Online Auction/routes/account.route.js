const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const moment = require('moment');
const userModel = require('../models/user.model');
const restrict = require('../middlewares/auth.mdw');
const nodemailer = require('nodemailer');

router.get('/register', async (req, res) => {
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
        var transporter = nodemailer.createTransport({ // config mail server
            service: 'gmail',
            auth: {
                user: 'hiendeptraiso1thegioi@gmail.com',
                pass: 'hiendeptraiqua'
            }
        });
        var mailOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: 'hiendeptraiso1thegioi@gmail.com',
            to: req.body.user_email,
            subject: 'Test Nodemailer',
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

router.get('/signin', async (req, res) => {
    res.render('vwAccount/signin');
});

router.post('/signin', async (req, res) => {
    //So sánh có người dùng hay không
    const user = await userModel.singleByEmail(req.body.user_email);
    if (user === null) {//Nếu không có người dùng
        return res.render('vwAccount/signin', {
            err_message: 'That email is not registered',
            useremail: req.body.user_email
        });
    }
    //Nếu có người dùng
    //So sánh có đúng password hay không
    const rs = bcrypt.compareSync(req.body.password, user.password);
    if (rs === false) {//Nếu không đúng password
        return res.render('vwAccount/signin', {
            err_message: 'Password incorrect',
            useremail: req.body.user_email
        })
    }
    //Nếu đúng password render màn hình home
    delete user.password;
    req.session.isAuthenticated = true;
    req.session.authUser = user;
    const url = req.query.retUrl || '/home';
    res.redirect(url);
});

router.get('/profile', restrict.forUser, (req, res) => {
    res.render('vwAccount/profile');
})

router.post('/signout', (req, res) => {
    req.session.isAuthenticated = false;
    req.session.authUser = null;
    res.redirect(req.headers.referer);
})

router.get('/verify', (req, res) => {
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
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/account/signin');
    }else{
        res.render('vwAccount/verify',{
            isWrongOTP: true,
        })
    }
})

module.exports = router;