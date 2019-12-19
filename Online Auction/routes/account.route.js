const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const moment = require('moment');
const userModel = require('../models/user.model');
const restrict = require('../middlewares/auth.mdw');

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
        const N = bcrypt.genSaltSync(10);
        console.log(raw_password);
        const hash = bcrypt.hashSync(raw_password, N);
        const dob = moment(user_dob, 'DD/MM/YYYY').format('YYYY-MM-DD');

        //Thiết lập các trường cần thiết
        const entity = req.body;
        entity.username = user_name;
        entity.password = hash;
        entity.firstname = first_name;
        entity.lastname = last_name;
        entity.email = user_email;
        entity.dob = dob;
        entity.type = 0;

        //Xóa những trường không cần thiết
        delete entity.user_name;
        delete entity.confirm_password;
        delete entity.raw_password;
        delete entity.first_name;
        delete entity.last_name;
        delete entity.user_email;
        delete entity.user_dob;
        delete entity.user_address;
        //Thêm user vào bảng và render trang login
        const result = await userModel.add(entity);
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/account/signin');
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

module.exports = router;