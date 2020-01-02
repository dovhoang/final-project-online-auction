const express = require('express');
const router = express.Router();
const userModel = require('../models/user.model');
const restrict = require('../middlewares/auth.mdw');
const nodemailer = require('nodemailer');

//Forgot password
router.get('/', restrict.forUserSignIn, (req, res) => {
    res.render('vwForgotPassword/forgotpassword')
})

router.post('/', async (req, res) => {
    //So sánh có người dùng hay không
    const user = await userModel.singleByEmail(req.body.email);
    if (user === null) {//Nếu không có người dùng
        return res.render('vwForgotPassword/forgotpassword', {
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
                return res.render('vwForgotPassword/forgotpassword');
            } else {
                console.log('Message sent: ' + info.response);
                req.session.OTP1 = otp;
                req.session.email = req.body.email;
                req.flash('success_msg', 'Please check your email for OTP');
                return res.redirect('/forgotpassword/otp');
            }
        });
    }
});

//OTP forgotpassword
router.get('/otp', restrict.forUserSignIn, restrict.forGuestNotEnterEmailRecovery, (req, res) => {
    res.render('vwForgotPassword/otpforgotpassword')
})

router.post('/otp', async (req, res) => {
    //Kiểm tra nếu OTP nhập vào có đúng không
    if (+req.body.OTP === +req.session.OTP1) {//Đúng
        req.session.OTP1 = null;
        req.session.isTrueOTP = true;
        res.redirect('/forgotpassword/newpassword');
    } else {//Không đúng
        res.render('vwForgotPassword/otpforgotpassword', {
            error: 'Wrong OTP'
        });
    }
});

//New password 
router.get('/newpassword', restrict.forUserSignIn, restrict.forGuestNotEnterOTP, (req, res) => {
    res.render('vwForgotPassword/newpassword')
})

router.post('/newpassword', async (req, res) => {
    //Kiểm tra 2 password có match hay không
    if (req.body.newpassword === req.body.confirmpassword) {//Nếu match
        const N = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.newpassword, N);
        req.body.password = hash;
        delete req.body.newpassword;
        delete req.body.confirmpassword;
        const user = await userModel.singleByEmail(req.session.email);
        const result = await userModel.patch(req.body, user.Username);
        //Xóa các session
        req.session.email = null;
        req.session.isTrueOTP = null;
        req.flash('success_msg', 'Change password success');
        res.redirect('/account/signin');
    } else {//Nếu không match
        res.render('vwForgotPassword/newpassword', {
            error: 'New Password and Confirm New Password not match',
        });
    }
});

module.exports = router;