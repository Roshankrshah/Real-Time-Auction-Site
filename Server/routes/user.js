const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { registerUser,getUserById } = require('../controllers/user');
const isAuth = require('../middlewares/isAuth');

router.post('/', [
    body('username', 'Invalid name').trim().not().isEmpty(),
    body('email', 'Invalid email').trim().isEmail(),
    body('password', 'Enter valid password with min length of 6 characters').exists().trim().isLength({ min: 6 })
], registerUser);

router.get('/:id',getUserById);

module.exports = router;