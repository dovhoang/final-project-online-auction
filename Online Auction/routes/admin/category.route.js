const express = require('express');
const categoryModel = require('../../models/category.model');
const router = express.Router();
var correct = true;// Tên cate không bị trùng - add cate
var correct2 =true;//Tên cate không bị trùng - edit cate
router.get('/', async (req, res) => {
  const rows = await categoryModel.all();
  res.render('vwAdmin/vwCategoryManager/index', {
    categories: rows,
    empty: rows.length === 0
  });
});
router.get('/add', async (req, res) => {
  const parentName = await categoryModel.allCatLevel1();
  res.render('vwAdmin/vwCategoryManager/add', {
    parentName,
    correct,
  });
})

router.post('/add', async (req, res) => {
  correct = true;
  const catdata = await categoryModel.all();
  const parentName = await categoryModel.allCatLevel1();
  catdata.forEach(element => {
    if (element.CatName === req.body.catName) {
      correct = false;
    }
  });
  
  if (correct === true) {
    const result = categoryModel.add(req.body.catName, req.body.parentId);
    res.redirect('/admin/categories')
  } else {
    res.render('vwAdmin/vwCategoryManager/add', {
      parentName,
      oldcatname: req.body.catName,
      oldparentid: req.body.parentId,
      correct,
    });
  }
})

router.get('/err', (req, res) => {
  throw new Error('error occured');
})

router.get('/edit/:id', async (req, res) => {
  const [rows, parentName] = await Promise.all([
    categoryModel.single(req.params.id),
    categoryModel.allCatLevel1(),
  ])

  if (rows.length === 0) {
    throw new Error('Invalid category id');
  }

  res.render('vwAdmin/vwCategoryManager/edit', {
    category: rows[0],
    parentName,
    oldcatname: rows[0].CatName,
    oldparentid: rows[0].ParentID,
    correct: correct2,
  });
})

router.post('/patch', async (req, res) => {
  correct2 = true;
  const [catdata,parentName] = await Promise.all([
  categoryModel.all(),
  categoryModel.allCatLevel1(),
  ]);
  
  catdata.forEach(element => {
    if (element.CatName === req.body.catName) {// Nếu trùng tên
      if(element.CatID != req.body.catID){// Khác id
        correct2 = false;
      }
    }
  });
  console.log("correct",correct2);
  if (correct2 === true) {
    const result = categoryModel.patch(req.body);
    res.redirect('/admin/categories')
  } else {
    res.render('vwAdmin/vwCategoryManager/edit', {
      parentName,
      oldcatname: req.body.catName,
      oldparentid: req.body.parentId,
      catid: req.body.catID,
      correct: correct2,
    });
  }
})

router.post('/del', async (req, res) => {
  const result = await categoryModel.del(req.body.CatID);
  res.redirect('/admin/categories');
})


module.exports = router;