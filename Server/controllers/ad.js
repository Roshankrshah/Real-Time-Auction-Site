const { validationResult } = require('express-validator');
const Ad = require('../models/Ad');
const User = require('../models/User');

const addAd = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    let { productName, basePrice, duration, image, category, description } = req.body;

    if (duration === null || duration === 0) duration = 300;
    if (duration > 10880) duration = 3600;

    // image = image === ''?'': `${process.env.}`

    const timer = duration;

    try {
        let ad = new Ad({
            productName,
            basePrice,
            currentPrice: basePrice,
            duration,
            timer,
            image,
            category,
            description,
            owner: req.user.id,
        });
        ad = await ad.save();

        const user = await User.findById(ad.owner);
        user.postedAds.push(ad._id);
        await user.save();

        res.status(200).json({ ad });
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
}  

const retrieveAds = async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    const {user,option} = req.query;
    let adList = [];
    try {
        if(user){
            adList = await Ad.find({owner: user}).sort({createdAt: -1});
        }else if(option === 'notexpired'){
            adList = await Ad.find({auctionEnded: false}).sort({createdAt: -1});
        }else{
            adList = await Ad.find().sort({createdAt: -1});
        }

        res.status(201).json(adList);
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
}

module.exports = {
    addAd,
    retrieveAds
}