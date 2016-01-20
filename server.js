'use strict';

const logging = require('./log')('server'),
      log = logging.log,

      WebSocketServer = require('websocket').server,
      http = require('http'),

      messages = require('./messages'),
      server2Client = require('./server2Client')(messages),

      Client = server2Client.Client,
      NullClient = server2Client.NullClient,
      Referee = require('./referee'),

      matchMaker = require('./matchMaker')(Client, NullClient, Referee),

      port = process.env.PORT || 5000,
      singleplayer = (process.env.SP ? process.env.SP === 'true' : false);

var conns = {};

// Start a HTTP server that doesn't respond to requests.
var httpServer = http.createServer();
httpServer.listen(port, function onHttpListening () {
    log('HTTP server is listening on port ' + port);
});

var wsServer = new WebSocketServer({ httpServer: httpServer });
wsServer.on('request', function onConnectionRequest (request) {
    var addr = request.remoteAddress;

    // We only check the first protocol for simplicity's sake.
    // Check all protocols could results in blocking if the protocol
    // list is too long.
    if (request.requestedProtocols[0] !== 'wishbanana') {
        // HTTP Error Code - I'm a teapot
        request.reject(418, 'Invalid websocket subprotocol requested.');
        return;
    }

    // Drop the old connection if this IP already has one.
    if (addr in conns) {
        // Websocket Close Code - Close Normal
        conns[addr].drop(1000, 'New connection established on this IP.');
        log(addr + ' => Dropping for new connection.', logging.DEBUG);
    }

    var conn = conns[addr] = request.accept('wishbanana', request.origin);
    log(addr + ' => Connection accepted.', logging.DEBUG);

    conn.on('close', function onConnectionClose (reasonCode, description) {
        log(addr + ' => Disconnected. Code: ' + reasonCode + ' Desc: ' + description, logging.DEBUG);
        matchMaker.dequeue(conn);
        delete conns[addr];
    });

    matchMaker.enqueue(conn);
});

matchMaker.singleplayer = singleplayer;
if (singleplayer) {
    log('Singleplayer mode!', logging.WARNING);
}