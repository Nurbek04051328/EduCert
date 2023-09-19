import { Centrifuge } from 'centrifuge';


// const { Client } = require('centrifuge');

// Replace 'YOUR_CENTRIFUGO_ENDPOINT' with the URL of your Centrifugo server endpoint
const centrifuge = new Centrifuge('ws://centrifuge.example.com/connection/websocket');


function sendNotification(channel, data) {
    centrifuge.publish(channel, data);
}

module.exports = sendNotification