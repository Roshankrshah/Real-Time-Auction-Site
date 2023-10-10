const Ad = require('../models/Ad');
const User = require('../models/User');

const io = require('../socket');

const startAuction = async(req,res)=>{
    const {adId} = req.params;

    try {
        let ad = await Ad.findById(adId).populate('owner',{password:0});

        if(!ad) return res.status(404).json({errors: [{msg: 'Ad not found'}]});

        if(ad.owner._id != req.user._id)
            return res.status(400).json({errors: [{msg: 'Unauthorized to start'}]});

        if(ad.auctionEnded){
            return res.status(400).json({errors: [{msg: 'Auction has already ended'}]});
        }
        if(ad.auctionStarted){
            return res.status(400).json({errors: [{msg:'Already Started'}]});
        }

        ad.auctionStarted = true;

        await ad.save();

        io.getAdIo()
            .to(ad._id.toString())
            .emit('auctionStarted',{action : 'Started' ,data: ad});
        
        res.status(200).json({msg: 'Auction Started Now'});

        ad.timer = parseInt(ad.duration);
        ad.auctionEnded = false;

        let duration = parseInt(ad.duration);
        let timer = parseInt(ad.timer);

        let intervalTimer = setInterval(async() => {
            timer -= 1;
            await ad.updateOne({timer: timer});

            io.getAdIo()
                .to(ad._id.toString())
                .emit('timer',{
                    action: 'timerUpdate',
                    data: {timer: timer, _id: ad._id}
                });
        }, 1000);

        setTimeout(async() => {
            clearInterval(intervalTimer);
            let auctionEndAd = await Ad.findById(ad._id).populate('owner',{password:0});
            auctionEndAd.auctionEnded = true;
            auctionEndAd.timer = 0;

            if(auctionEndAd.currentBidder){
                console.log('ad sold');
                auctionEndAd.purchasedBy = auctionEndAd.currentBidder;
                auctionEndAd.sold = true;
                await auctionEndAd.save();

                let winner = await User.findById(auctionEndAd.currentBidder);
                winner.purchasedProducts.push(auctionEndAd._id);
                await winner.save();


                io.getAdIo()
                    .to(auctionEndAd._id.toString())
                    .emit('auctionEnded',{action : 'sold',ad: auctionEndAd, winner: winner});
            }else{
                io.getAdIo()
                    .to(auctionEndAd._id.toString())
                    .emit('auctionEnded',{action: 'notSold', data:auctionEndAd});

                await auctionEndAd.save();
            }
        }, (duration+1)*100);
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
}

module.exports = {
    startAuction
}