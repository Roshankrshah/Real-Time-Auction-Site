const mongoose = require('mongoose');
const types = mongoose.Types;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    purchasedProducts: [
        {
            type: types.ObjectId,
            ref: 'Ad'
        }
    ],
    postedAds: [
        {
            type: types.ObjectId,
            ref: 'Ad'
        }
    ],
    bids: [
        {
            type: types.ObjectId,
            ref: 'Ad'
        }
    ]
});

module.exports = mongoose.model('User', userSchema);