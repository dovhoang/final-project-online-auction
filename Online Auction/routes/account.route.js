const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const moment = require('moment');
const userModel = require('../models/user.model');


router.get('/register', async (req, res) => {
    res.render('vwAccount/register');
});

router.post('/register', async (req, res) => {
    const N = 10;
    const hash = bcrypt.hashSync(req.body.raw_password, N);
    const dob = moment(req.body.user_dob, 'DD/MM/YYYY').format('YYYY-MM-DD');

    const entity = req.body;
    entity.username = req.body.user_name;
    entity.password = hash;
    entity.firstname = req.body.first_name;
    entity.lastname = req.body.last_name;
    entity.email=req.body.user_email;
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
    res.render('vwAccount/register');
});

module.exports = router;