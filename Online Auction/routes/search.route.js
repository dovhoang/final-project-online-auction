
const express = require('express');
const productModel = require('../models/product.model');
const config = require('../config/default.json');
const fuzzy = require('fuzzy');
const router = express.Router();

router.get('/', async (req, res) => {

    const keyword = req.query.keyword;
    const [allpro] = await Promise.all([
        productModel.allWithBidInfo(),
    ])
    var options = {
        pre: '<'
        , post: '>'
        , extract: function (el) { return el.ProductName; }
    };
    var results = fuzzy.filter(keyword, allpro, options);
    console.log(results);

    const limit = config.paginate.limit;
    const page = req.query.page || 1;
    const sortby = req.query.sortby || "NumBid";
    const order = req.query.order || "desc";

    if (page < 1) page = 1;
    const offset = (page - 1) * config.paginate.limit;
    const pro_page = [];
    const total = results.length;
    for (i = 0; i < limit; i++) {
        if (offset+i < total)
        pro_page.push(results[offset+i]);
    }
    let nPages = Math.floor(total / limit);
    if (total % limit > 0 || total == 0) nPages++;
    const SumPage = nPages;
    const page_numbers = [];
    for (i = 1; i <= nPages; i++) {
        page_numbers.push({
            value: i,
            isCurrentPage: i === +page,
            sortby,
            order
        })
    }
    
    res.render("vwProducts/allBySearch", {
        products: pro_page,
        empty: pro_page.length === 0,
        page_numbers,
        prev_value: +page - 1,
        next_value: +page + 1,
        over_page: SumPage === +page,
        keyword,
        sortby,
        order
    })
    
});
router.post("/", (req, res) => {
    keyword = req.body.search;
    console.log("key= ", keyword);
    res.redirect("?keyword=" + keyword);
});

module.exports = router;