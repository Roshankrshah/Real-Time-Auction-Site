const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const isAuth = require('../middlewares/isAuth');
const {addAd} = require('../controllers/ad');


router.post('/',isAuth,[
    body('productName', 'Invalid productName').trim().not().isEmpty(),
    body('basePrice', 'Invalid basePrice').trim().isNumeric(),
    body('duration','Invalid time duration').trim().isNumeric()
],addAd);

module.exports = router;