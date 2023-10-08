const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        const { username, email, password, phone, address } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username: username,
            email,
            password: hashedPassword,
            phone,
            address
        });

        await user.save();

        const payload = {
            user: {
                id: user._id,
                email,
                username,
            },
        };

        jwt.sign(payload, process.env.JWT_SEC, { expiresIn: '1d' }, (err, token) => {
            if (err) {
                throw err;
            }
            return res.status(200).json({ token });
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({errors: [{msg: 'Server error'}]});
    }
}

module.exports = {
    registerUser
}