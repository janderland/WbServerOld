// Wish Banana
// Game Server
// Entry point for the wish banana server.

var WebSocketServer = require('websocket').server;
var http = require('http');
var queueToPlay = require('./matchMaker.js').queueToPlay;

function log (msg) {
    // TODO
    console.log(msg);
}

var port = 3456;
var conns = {};

var httpServer = http.createServer();
httpServer.listen(port, function onHttpListening () {
    log('HTTP server is listening on port ' + port);
});

var wsServer = new WebSocketServer({ httpServer: httpServer });
wsServer.on('request', function onConnectionRequest (request) {
    var addr = request.remoteAddress;

    // Drop the old connection if this IP already has one.
    if (addr in conns) {
        conns[addr].drop(1000, 'New connection established.');
    }

    var conn = conns[addr] = request.accept('wishbanana', request.origin);
    log('Connection from ' + conn.remoteAddress + ' accepted.');

    queueToPlay(conn);

    conn.on('close', function onConnectionClose (reasonCode, description) {
        log('Client ' + conn.remoteAddress + ' disconnected.');
        log(reasonCode + ' ' + description);
        delete conns[addr];
    });
});