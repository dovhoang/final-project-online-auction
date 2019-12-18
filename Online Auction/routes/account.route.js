const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const moment = require('moment');
const userModel = require('../models/user.model');
var request = require('request');
var bodyParser = require('body-parser');



router.get('/register', async (req, res) => {
    res.render('vwAccount/register');
});

router.post('/register', async (req, res) => {

    //Kiểm tra trong db đã có user có username trùng không
    const checkdb = await userModel.single1(req.body.user_name);
    const checkemail = await userModel.single2(req.body.user_email);
    console.log(req.body.user_name);
    if (checkdb[0] == undefined) {
        if (checkemail[0] == undefined) {
            const N = 10;
            const hash = bcrypt.hashSync(req.body.raw_password, N);
            const dob = moment(req.body.user_dob, 'DD/MM/YYYY').format('YYYY-MM-DD');

            const entity = req.body;
            entity.username = req.body.user_name;
            entity.password = hash;
            entity.firstname = req.body.first_name;
            entity.lastname = req.body.last_name;
            entity.email = req.body.user_email;
            entity.dob = dob;
            entity.type = 0;

            delete entity.user_name;
            delete entity.raw_password;
            delete entity.first_name;
            delete entity.last_name;
            delete entity.user_email;
            delete entity.user_dob;
            delete entity.user_address;

            const result = await userModel.add(entity);
            res.render('vwAccount/register', {
                hasUserNameInDatabase: false,
                hasEmailInDatabase: false,
                signUpSuccess: true,
            });
        } else {
            res.render('vwAccount/register', {
                hasUserNameInDatabase: false,
                hasEmailInDatabase: true,
                signUpFailed: true,
            });
        }
    } else {
        if (checkemail[0] == undefined) {
            res.render('vwAccount/register', {
                hasUserNameInDatabase: true,
                hasEmailInDatabase: false,
                signUpFailed: true,
            });
        } else {
            res.render('vwAccount/register', {
                hasUserNameInDatabase: true,
                hasEmailInDatabase: true,
                signUpFailed: true,
            });
        }
    }
});

// router.post('/register', (req, res) => {
//     if(
//         req.body.captcha ===undefined ||
//         req.body.captcha ==='' ||
//         req.body.captcha ===null
//     ){
//         return res.json({"success": false,"msg":"Please select captcha"});
//     }

//     const secretKey = '6LdiUsgUAAAAAGMzB2NaH25P6HidWvJR9XHW_7kz';
//     const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;

//     request(verifyUrl, (err,response,body) =>{
//         body = JSON.parse(body);

//         if(body.success !== undefined && !body.success){
//             res.json({"success": false,"msg":"Failed captcha verification"});
//         }

//         return res.json({"success": true,"msg":"Captcha passed"});
//     })
// });

module.exports = router;