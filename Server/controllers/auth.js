const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const login = async(req,res)=>{
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        const {email ,password} = req.body;

        let user = await User.findOne({email});
        if(!user){
            return res.status(403).json({errors: [{msg: 'Invalid Credentials'}]});
        }

        const matched = await bcrypt.compare(password, user.password);
        if(!matched){
            return res.status(403).json({errors: [{msg: 'Invalid Credentials'}]});
        }

        const payload = {
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
            }
        };

        jwt.sign(payload,process.env.JWT_SEC, {expiresIn: 36000},(err,token)=>{
            if(err){
                throw err;
            }
            res.status(200).json({token});
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({errors: [{msg: 'Server error'}]});
    }
};

module.exports = {
    login
}