const Ad = require('../models/Ad');


const listBids = async (req, res) => {
    const { adId } = req.params;
    let { option } = req.query;

    option = option ? option : 'default';

    try {
        const ad = await Ad.findById(adId);
        await ad.populate('bids.user', { password: 0 });

        if (!ad) return res.status(404).json({ errors: [{ msg: 'Ad not found' }] });

        const bidList = ad.bids;
        if (option.toString() === 'highest') {
            res.status(200).json([bibList[bidList.length - 1]]);
        } else {
            res.status(200).json(bidList);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
}

module.exports = {
    listBids
}