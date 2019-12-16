
const express = require('express');
const productModel = require('../../models/product.model');
const router = express.Router();

router.get('/:id/products', async (req, res) => {

  // for (const c of res.locals.lcCategories) {
  //   if (c.CatID === +req.params.id) {
  //     c.isActive = true;
  //   }
  // }

  const rows = await productModel.allByCat(req.params.id);
  res.render('vwCatProducts/allByCat', {
    product: rows,
    empty: rows.length === 0
  });
})

module.exports = router;