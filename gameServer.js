'use strict';

const logging = require('./log')('gameServer'),
      log = logging.log;

const WebSocketServer = require('websocket').server,
      http = require('http'),

      messages = require('./messages'),
      Client = require('./server2Client')(messages),
      Referee = require('./referee'),
      matchMaker = require('./matchMaker')(Client, Referee),

      port = 3456;

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
        conns[addr].drop(conn.CLOSE_REASON_NORMAL, 'New connection established.');
        log('Dropping connection to ' + addr + ' for new connection.', logging.DEBUG);
    }

    var conn = conns[addr] = request.accept('wishbanana', request.origin);
    log('Connection from ' + addr + ' accepted.', logging.DEBUG);

    conn.on('close', function onConnectionClose (reasonCode, description) {
        log('Client ' + conn.remoteAddress + ' disconnected. Code: ' + reasonCode + '. Desc: ' + description,
            logging.DEBUG);
        delete conns[addr];
    });

    var ref = matchMaker.queueToPlay(conn);
    if (ref !== null) {
        ref.startGame();
    }
});