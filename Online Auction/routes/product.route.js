
const express = require('express');
const productModel = require('../models/product.model');
const router = express.Router();
// express.static('../assets');
// express.static('../pictures');
router.get('/id=:id', async (req, res) => {
  const rows = await productModel.single(req.params.id);
  res.render('vwSingleProduct/singleProduct', {
    product: rows,
    empty: rows.length === 0
  });
})

module.exports = router;