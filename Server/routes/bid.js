const express = require('express');
const router = express.Router();

const isAuth = require('../middlewares/isAuth');
const { listBids, addBid } = require('../controllers/bid');


router.post(':adId?', isAuth, addBid);
router.get('/:adId?', isAuth, listBids);

module.exports = router;