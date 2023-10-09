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

const getUserById = async(req,res) =>{
    const id = req.params.id;
    console.log(id);
    try{
        const user = await User.findById(id,{password:0});
        if(!user){
            return res.status(404).json({errors: [{msg: 'User not Found'}]});
        }
        return res.status(200).json({user});
    }catch(error){
        console.log(error);
        return res.status(500).json({errors: [{msg: 'Server error'}]});
    }
}

const purchasedProducts = async(req,res)=>{
    const {user}= req;
    try {
        const fetchedUser = await User.findById(user.id);
        await fetchedUser.populate('purchasedProducts');
        res.status(200).json(fetchedUser.purchasedProducts);
    } catch (error) {
        console.log(error);
        return res.status(500).json({errors: [{msg: 'Server error'}]});
    }
}

const postedProducts = async(req,res)=>{
    const {user} = req;
    try {
        const fetchedUser = await User.findById(user.id);
        await fetchedUser.populate('postedAds');
        res.status(200).json(fetchedUser.postedAds);
    } catch (error) {
        console.log(error);
        return res.status(500).json({errors: [{msg: 'Server error'}]});
    }
}

module.exports = {
    registerUser,
    getUserById,
    purchasedProducts,
    postedProducts
}