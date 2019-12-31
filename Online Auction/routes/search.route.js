
const express = require('express');
const productModel = require('../models/product.model');
const config = require('../config/default.json');
const fuzzy = require('fuzzy');
const router = express.Router();

router.get('/', async (req, res) => {
    req.query.keyword = req.session.keyword;
    const keyword = req.query.keyword;
    const limit = config.paginate.limit;
    const page = req.query.page || 1;
    const sortby = req.query.sortby || "NumBid";
    const order = req.query.order || "desc";

    if (page < 1) page = 1;
    const offset = (page - 1) * config.paginate.limit;
    const [total] = await Promise.all([
        productModel.all(),
    ])
    var options = {
        pre: '<'
        , post: '>'
        , extract: function (el) { return el.ProductName; }
    };
    var results = fuzzy.filter(keyword, total, options)
    var matches = results.map(function (el) { return el.string; });
    console.log(results);
})



module.exports = router;