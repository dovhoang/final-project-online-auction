
const express = require('express');
const productModel = require('../../models/product.model');
const config = require('../../config/default.json');
const router = express.Router();

router.get('/:id/products', async (req, res) => {

  const catId = req.params.id;
  const limit = config.paginate.limit;

  const sort = req.query.sort || 1
  // const myquery = [
  //   {id:1 ,add: "p4.PriceStart ASC"},
  //   {id:2 ,add: "p4.PriceStart DESC"},
  //   {id:3 ,add: "p4.TimeExp ASC"},
  //   {id:4 ,add: "p4.TimeExp DESC"},
  // ]
  // if(sort == myquery.id){
  //   const addrow = myquery.add
  // }

  const page = req.query.page || 1;
  if (page < 1) page = 1;
  const offset = (page - 1) * config.paginate.limit;

  const [total, rows] = await Promise.all([
    productModel.countByCat(catId),
    productModel.pageByCat(catId, offset)
  ]);

  let nPages = Math.floor(total / limit);
  if (total % limit > 0) nPages++;
  const SumPage = nPages;
  const page_numbers = [];
  for (i = 1; i <= nPages; i++) {
    page_numbers.push({
      value: i,
      isCurrentPage: i === +page
    })
  }

  

  res.render('vwCatProducts/allByCat', {
    products: rows,
    empty: rows.length === 0,
    page_numbers,
    prev_value: +page - 1,
    next_value: +page + 1,
    over_page: SumPage === +page,
  });
})

module.exports = router;