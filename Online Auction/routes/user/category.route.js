
const express = require('express');
const productModel = require('../../models/product.model');
const config = require('../../config/default.json');
const router = express.Router();

router.get('/:id/products', async (req, res) => {

  const catId = req.params.id;
  const limit = config.paginate.limit;

  const page = req.query.page || 1;
  const sortby = req.query.sortby|| "NumBid";
  const order = req.query.order || "desc" ;
 
  if (page < 1) page = 1;
  const offset = (page - 1) * config.paginate.limit;

  const [total, rows,catname] = await Promise.all([
    productModel.countByCat(catId),
    productModel.pageByCat(catId, offset,sortby,order),
    productModel.getCategoryNameById(catId),
  ]);

  let nPages = Math.floor(total / limit);
  if (total % limit > 0 || total == 0 ) nPages++;
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

  res.render('vwCatProducts/allByCat', {
    products: rows,
    empty: rows.length === 0,
    page_numbers,
    prev_value: +page - 1,
    next_value: +page + 1,
    over_page: SumPage === +page,
    catname,
    sortby,
    order
  });
})

module.exports = router;