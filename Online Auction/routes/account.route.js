const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const moment = require('moment');
const userModel = require('../models/user.model');

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
        userModel.single1(user_name),
        userModel.single2(user_email)
    ]);

    if (checkusername[0] != undefined)
        error.push({ msg: 'Username is already registered' });
    if (checkemail[0] != undefined)
        error.push({ msg: 'Email is already registered' });

    if (error.length > 0) {//Nếu có lỗi
        let fields = req.body;
        res.render('vwAccount/register', {
            error,
            fields,
        });
    } else {//Nếu không có lỗi
        const N = 10;
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
        req.flash('success_msg','You are now registered and can log in');
        res.redirect('/account/signin');
    }
});

router.get('/signin', async (req, res) => {
    res.render('vwAccount/signin');
});

router.post('/signin', (req, res, next) => {
    
});

module.exports = router;