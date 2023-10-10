const express = require('express');
const router = express.Router();

const isAuth = require('../middlewares/isAuth');
const {startAuction} = require('../controllers/auction');

router.get('/start/:adId',isAuth,startAuction);

module.exports = router;