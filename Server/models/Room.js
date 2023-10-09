const mongoose = require('mongoose');
const types = mongoose.Types;

const roomSchema = new mongoose.Schema(
    {
        ad: {
            type: types.ObjectId,
            ref: 'Ad',
            required: true,
        },
        users: [
            {
                type: types.ObjectId,
                ref: 'User'
            }

        ]
    },
    {timestamps: true}
)

module.exports = mongoose.model('Room',roomSchema);