require('dotenv').config();
const express = require('express');
const connectDB = require('./db/config');
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.get('/',(req,res)=>{
    res.send('Starting Online Auction website');
})

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
