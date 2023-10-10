const { Centrifuge  } = require('centrifuge');

// Replace 'YOUR_CENTRIFUGO_ENDPOINT' with the URL of your Centrifugo server endpoint

const centr = new Centrifuge('https://cdnjs.cloudflare.com/ajax/libs/centrifuge/4.0.1/centrifuge.js.map');

const transports = [
    {
        transport: 'websocket',
        endpoint: 'ws://example.com/connection/websocket'
    },
    {
        transport: 'http_stream',
        endpoint: 'http://example.com/connection/http_stream'
    },
    {
        transport: 'sse',
        endpoint: 'http://example.com/connection/sse'
    }
];
const centrifuge = new Centrifuge(centr);
const sub = centrifuge.newSubscription('news');

// Optional: Handle connection events
centrifuge.on('connect', () => {
    console.log('Connected to Centrifugo server');
});

centrifuge.on('disconnect', () => {
    console.log('Disconnected from Centrifugo server');
});

// Connect to the Centrifugo server
centrifuge.connect()
module.exports = {centrifuge};