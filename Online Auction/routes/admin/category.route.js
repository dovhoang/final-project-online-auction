const express = require('express');
const categoryModel = require('../../models/category.model');
const router = express.Router();

router.get('/', async (req, res) => {
    const rows = await categoryModel.all();
    res.render('vwAdmin/vwCategoryManager/index', {
      categories: rows,
      empty: rows.length === 0
    });
  })

module.exports = router;