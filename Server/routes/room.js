const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const isAuth = require('../middlewares/isAuth');
const {joinRoom, getRoom} = require('../controllers/room');

router.post('/join/:roomId',isAuth,joinRoom);
router.get('/:roomId',isAuth,getRoom);

module.exports = router;