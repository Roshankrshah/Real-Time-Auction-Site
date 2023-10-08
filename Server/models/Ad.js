const mongoose = require('mongoose');
const types = mongoose.Types;

const adSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        basePrice: {
            type: types.Decimal128,
            required: true,
        },
        currentPrice: {
            type: types.Decimal128,
            required: true,
        },
        duration: {
            type: Number,
            default: 300,
        },
        timer: {
            type: Number,
            default: 200,
        },
        soldAt: {
            type: Date,
        },
        image: {
            type: String,
        },
        category: {
            type: String,
        },
        auctionStarted: {
            type: Boolean,
            default: false,
        },
        auctionEnded: {
            type: Boolean,
            default: false,
        },
        sold: {
            type: Boolean,
            default: false,
        },
        owner: {
            type: types.ObjectId,
            ref: 'User',
        },
        purchasedBy: {
            type: types.ObjectId,
            ref: 'User'
        },
        currentBidder: {
            type: types.ObjectId,
            ref: 'User'
        },
        bids: [
            {
                user: {
                    type: types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                amount: {
                    type: types.Decimal128,
                    required: true,
                },
                time: {
                    type: Date,
                    default: Date.now()
                },
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Ad',adSchema);