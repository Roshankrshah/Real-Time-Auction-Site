const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const isAuth = require('../middlewares/isAuth');
const { login,getUser } = require('../controllers/auth');

router.post('/', [
            body('email', 'Invalid Credentials').isEmail().trim(),
            body('password', 'Invalid Credentials').exists().trim()
        ],login);

router.get('/',isAuth,getUser);

module.exports = router;