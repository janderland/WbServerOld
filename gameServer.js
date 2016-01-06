// Wish Banana
// Game Server
// Entry point for the wish banana server.

var logging = require('./log.js').getLoggingHandle('gameServer');
var log = logging.log;
var WebSocketServer = require('websocket').server;
var http = require('http');
var queueToPlay = require('./matchMaker.js').queueToPlay;

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
        log('Dropping connection to ' + addr + ' for new connection.', logging.DEBUG);
    }

    var conn = conns[addr] = request.accept('wishbanana', request.origin);
    log('Connection from ' + addr + ' accepted.', logging.DEBUG);

    conn.on('close', function onConnectionClose (reasonCode, description) {
        log('Client ' + conn.remoteAddress + ' disconnected. Code: ' + reasonCode + '. Desc: ' + description);
        delete conns[addr];
    });

    var ref = queueToPlay(conn);
    if (ref !== null) {
        ref.startGame();
    }
});