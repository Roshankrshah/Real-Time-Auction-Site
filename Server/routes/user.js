const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { registerUser } = require('../controllers/user');

router.post('/', [
    body('username', 'Invalid name').trim().not().isEmpty(),
    body('email', 'Invalid email').trim().isEmail(),
    body('password', 'Enter valid password with min length of 6 characters').exists().trim().isLength({ min: 6 })
], registerUser);

module.exports = router;