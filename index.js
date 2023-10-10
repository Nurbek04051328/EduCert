const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const http = require('http');



const routerList = require('./router.js')

const app = express();
const server = http.createServer(app);
const {Server} = require('socket.io')
const io = new Server(server, {
    cors: {origin: ''},

});



const PORT = process.env.PORT || 3005;






app.use(fileUpload({
    limits: {
        fileSize: 1000000*30 //1mb
    },
    abortOnLimit: true
}));

app.use('/files',express.static('files'))




module.exports = {io}

app.use(express.json());
app.use(cors());
app.use(routerList);





const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        server.listen(PORT, () => {
            console.log(`Server ${PORT} da ishladi`);
        })
    } catch (error) {
        console.log(error);

    }
};

start()