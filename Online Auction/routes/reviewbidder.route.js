const express = require('express');
const router = express.Router();
const restrict = require('../middlewares/auth.mdw');

router.get('/:username', async (req, res) => {
   
    res.render('vwReview/reviewbidder', {
       
    });
});

module.exports = router;