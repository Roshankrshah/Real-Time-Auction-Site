const { validationResult } = require('express-validator');
const Ad = require('../models/Ad');
const User = require('../models/User');
const Room = require('../models/Room');
const io = require('../socket');

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

    //image = image === ''?'': `${process.env.}`

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

        let room = new Room({ad: ad._id});
        room = await room.save();

        ad.room = room._id;
        ad = await ad.save();

        const user = await User.findById(ad.owner);
        user.postedAds.push(ad._id);
        await user.save();

        io.getIo().emit('addAd',{action: 'add', ad:ad});

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

const findAd = async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    const adId = req.params.id;

    try {
        const ad = await Ad.findById(adId).populate('owner',{password:0});
        if(!ad) return res.status(404).json({errors: [{msg: 'Ad not found'}]});
        res.status(201).json(ad);
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
}

const updateAd = async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    const adId = req.params.id;

    try {
        const ad = await Ad.findById(adId);
        if(!ad) return res.status(404).json({errors: [{msg: 'Ad not found'}]});
        if(ad.owner != req.user.id){
            return res.status(401).json({errors: [{msg: 'Unauthorized to update this ad'}]});
        }

        if(req.body.basePrice){
            req.body.currentPrice = req.body.basePrice;
        }

        let updatedAd = await Ad.findByIdAndUpdate(adId,req.body);
        updatedAd = await Ad.findById(adId);

        res.status(200).json(updatedAd);
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
}

const deleteAd = async(req,res)=>{
    const adId = req.params.id;
    try{
        let ad = await Ad.findById(adId);
        if(!ad) return res.status(404).json({errors: [{msg: 'Ad not found'}]});
        if(ad.owner != req.user.id)
            return res.status(401).json({errors: [{msg: 'Unauthorized to delete this ad'}]});
        
        if(ad.auctionStarted || ad.auctionEnded){
            return res.status(402).json({errors: [{msg: 'Cannot delete, auction started/ended'}]});
        }

        await Ad.deleteOne(ad);
        res.status(200).json({msg: 'Deleted'});
    }catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
}

module.exports = {
    addAd,
    retrieveAds,
    findAd,
    updateAd,
    deleteAd
}