const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { login } = require('../controllers/auth');

router.post('/', [
            body('email', 'Invalid Credentials').isEmail().trim(),
            body('password', 'Invalid Credentials').exists().trim()
        ],login);

module.exports = router;