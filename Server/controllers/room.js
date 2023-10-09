const Room = require('../models/Room');

const joinRoom = async(req,res)=>{
    const {user} = req;
    const {roomId} = req.params;

    try {
        let room = await Room.findById(roomId);

        const userInRoom = await room.users.find((roomUser)=>{
            return roomUser._id == user.id ? true: false;
        });

        if(userInRoom){
            return res.status(400).json({errors: [{msg:'Already Joined'}]});
        }

        room.users.push(user.id);
        room.populate('users',{passwords:0});
        room = await room.save();
        res.status(200).json({msg: 'Successfully joined',room});
    } catch (error) {
        console.log(error);
        res.status(500).json({errors: [{msg: 'Server error'}]});
    }
}

const getRoom = async(req,res)=>{
    const {roomId} = req.params;

    try{
        let room = await Room.findById(roomId).populate('users',{password:0});
        res.status(200).json(room);
    } catch (error) {
        console.log(error);
        res.status(500).json({errors: [{msg: 'Server error'}]});
    }
}


module.exports = {
    joinRoom,
    getRoom
}