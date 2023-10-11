const express = require('express');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

const { upload } = require('../utils/fileUpload');
const isAuth = require('../middlewares/isAuth');


router.post('/image',isAuth,upload.single('image'),async(req,res)=>{
    const file = req.file;
    try{
        const result = await cloudinary.uploader.upload(file.path,{
            folder: "Auction",
            resource_type: "image"
        });
        fs.unlinkSync(file.path);
        res.status(201).json({imagePath: result.secure_url});
    }catch(error){
        console.log(error);
        return res.status(500).json({errors: [{msg: 'Server error'}]});
    }
})

module.exports = router;
