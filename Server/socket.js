const { Server } = require('socket.io');

let io, adIo;

exports.init = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_BASE_URL,
            methods: ['*'],
            allowedHeaders: ['*'],
        },
    })
    return io;
}

//exports.initAdIo = (server,path = '/socket/adpage')

exports.getIo = ()=>{
    if(!io){
        throw new Error('Socket.io not initialized');
    }
    return io;
}
