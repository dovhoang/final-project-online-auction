
const express = require('express');
const productModel = require('../models/product.model');
const searchModel = require('../models/search.model');
const config = require('../config/default.json');
const fuzzy = require('fuzzy');
const router = express.Router();


router.get('/', async (req, res) => {

    const keyword = req.query.keyword;
    const limit = config.paginate.limit;
    const page = req.query.page || 1;
    const sortby = req.query.sortby || "NumBid";
    const order = req.query.order || "desc";
   
    const [allpro] = await Promise.all([
        productModel.allWithBidInfo(),
    ])
    var options1 = {
        pre: '<'
        , post: '>'
        , extract: function (el) { return el.ProductName; }
    };
    var options2 = {
        pre: '<'
        , post: '>'
        , extract: function (el) { return el.CatName; }
    };

    var results1 = fuzzy.filter(keyword, allpro, options1);
    var results2 = fuzzy.filter(keyword, allpro, options2);
    var catname = [];
    for (i = 0; i < results2.length; i++) {
        var c = results2[i].original.CatName//Lấy tên category
        if (catname.length > 0) {
            if (c != catname[catname.length - 1]) {//Nếu khác thì thêm vào
                catname.push(c);
            }
        } else {//lần đầu thì thêm vào
            catname.push(c);
        }
    }

    var results = results1.concat(results2);
    //Lọc kq trùng
    var len = results.length;
    for (i = 0; i < len - 1; i++) {
        for (j = i + 1; j < len; j++) {
            if (results[i].original.ProductID === results[j].original.ProductID) {
                if (i != j) {
                    results.splice(j, 1);//Xoá pro trùng
                    len--;
                }
            }
        }
    }
    //sắp xếp
    var arrsortby=["PriceStart","TimeExp","TimePost","NumBid"];
    var intsortby, intorder;
    for(i=0;i<arrsortby.length;i++){
        if (arrsortby[i]===sortby){
            intsortby=i;
        } 
    }
    if(order==="asc"){
        intorder = 0;
    }else{
        intorder= 1;
    }
    const rs = await searchModel.interChangeSort(results,intorder,intsortby);
    //Phân trang
    if (page < 1) page = 1;
    const offset = (page - 1) * config.paginate.limit;
    const pro_page = [];
    const total = results.length;
    for (i = 0; i < limit; i++) {
        if (offset + i < total)
            pro_page.push(results[offset + i]);
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
        catname,
        proname: results1.length,
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