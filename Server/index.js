require('dotenv').config();
const express = require('express');
const connectDB = require('./db/config');
const auth = require('./routes/auth');
const user = require('./routes/user');
const ad = require('./routes/ad');
const upload = require('./routes/upload');
const room = require('./routes/room');
const app = express();

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

const PORT = process.env.PORT || 4444;


const start = async()=>{
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(PORT,()=>{
            console.log(`Server is listening on http://localhost:${PORT}`);
        })
    } catch (error) {
        console.log('Error', error);
    }
}

start();
