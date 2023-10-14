require('dotenv').config();
const express = require('express');

const {createServer} = require('http');
const socketio = require('./socket');

const connectDB = require('./db/config');

const auth = require('./routes/auth');
const user = require('./routes/user');
const ad = require('./routes/ad');
const upload = require('./routes/upload');
const room = require('./routes/room');
const auction = require('./routes/auction');
const bid = require('./routes/bid');

const app = express();
const server = createServer(app);
const io = socketio.init(server);
const adIo = socketio.initAdIo(server,'/socket/adpage');

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.get('/',(req,res)=>{
    res.send('Starting Online Auction website');
});

app.use('/auth',auth);
app.use('/user',user);
app.use('/ad',ad);
app.use('/upload',upload);
app.use('/room',room);
app.use('/auction',auction);
app.use('/bid',bid);

const PORT = process.env.PORT || 4444;

io.on('connection',(socket)=>{
    socket.on('disconnect',(reason)=>{

    });
    socket.on('leaveHome',()=>{
        socket.disconnect();
    })
});

adIo.on('connect',(socket)=>{
    console.log('connected');
    socket.on('joinAd',(ad)=>{
        socket.join(ad.toString());
    });
    socket.on('leaveAd',({ad})=>{
        socket.leave(ad.toString());
    });

    socket.on('disconnect',()=>{

    })
})

const start = async()=>{
    try {
        await connectDB(process.env.MONGO_URI);
        server.listen(PORT,()=>{
            console.log(`Server is listening on http://localhost:${PORT}`);
        })
    } catch (error) {
        console.log('Error', error);
    }
}

start();
