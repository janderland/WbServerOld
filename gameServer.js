// Server Entry Point
// gameServer.js

//// Requires ////

var webSocketServer = require('websocket').server;
var http = require('http');

// WB Requires
var matchMaker = require('./matchMaker.js');
var utilities = require('./utilities');
var log = utilities.log;


//// Settings ////
var port = 8080;


//// Misc Members ////

// The 'conns dictionary'. This stores all the active connection objects keyed by their origin IP.
var conns = {};


//// HTTP Server ////

var server = http.createServer(function(request, response) {
        // Always return "404 - Not Found" to every request.
    	response.writeHead(404);
    	response.end();
    }
});

server.listen(port, function() {
    log('HTTP server is listening on port ' + port);
});


//// Web Socket Server ////

wsServer = new webSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {
    var origin = request.origin;

    // Drop the old connection to this origin if one is already established.
    if (origin in conns) {
        conn[origin].drop(1000, 'New connection established.');
    }
    
    var conns[origin] = request.accept('wishbanana', origin);
    log('Connection from ' + conns[origin].remoteAddress + ' accepted.');

    // Setup connection to await match.
    matchMaker(conns[origin]);

    // On connection close, log the reason code and description and then
    // remove the connection from the Conns dictionary.
    conns[origin].on('close', function(reasonCode, description) {
        log('Client ' + conns[origin].remoteAddress + ' disconnected.');
        log(reasonCode + ' ' + description);
        delete conns[origin];
    });
});