const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const isAuth = require('../middlewares/isAuth');
const {addAd, retrieveAds,findAd, updateAd, deleteAd} = require('../controllers/ad');


router.post('/',isAuth,[
    body('productName', 'Invalid productName').trim().not().isEmpty(),
    body('basePrice', 'Invalid basePrice').trim().isNumeric(),
    body('duration','Invalid time duration').trim().isNumeric()
],addAd);

router.get('/?',isAuth,retrieveAds);
router.get('/:id',isAuth,findAd);
router.put('/:id',isAuth,updateAd);
router.delete('/:id',isAuth,deleteAd);

module.exports = router;