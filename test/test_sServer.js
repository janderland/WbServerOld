// Unit Test- Socket Server

var webSocket = require('websocket');
var http = require('http');
var should = require('should');
var eventEmitter = require('events').EventEmitter;
var util = require('util');

var sServer = require('../sServer.js').sServer;
var messages = require('../messages.js');

function log (msg) {
	console.log('\t' + msg);
}

describe('sServer', function () {
	var conn;
	var theServerSock;
	var theClientSock;
	var server;
	var wsServer;
	var wsClient;
	var port = 9090;

	// Helper class handling the client's connection.
	function clientSock (conn) {
		eventEmitter.call(this);
		var thisSock = this;

		conn.on('message', function (rawMsg) {
			var msg;
			if (rawMsg.type == 'utf8') {
				msg = JSON.parse(rawMsg.utf8Data);

				if (msg.Id == messages.msgIds.NamePlease) {
					thisSock.emit('namePlease');
				}
				else if (msg.Id == messages.msgIds.Matched) {
					thisSock.emit('matched', msg.OpponentName);
				}
				else if (msg.Id == messages.msgIds.CountDown) {
					thisSock.emit('countDown', msg.Value);
				}
				else if (msg.Id == messages.msgIds.GameOver) {
					thisSock.emit('gameOver', msg.Won);
				}
				else {
					throw new Error('Unknown message id: ' + msg.id);
				}
			}
			else {
				throw new Error('Message received binary message.');
			}
		});

		conn.on('close', function () {
			thisSock.emit('close');
		});
	}
	util.inherits(clientSock, eventEmitter);

	// Setup the client and server sockets.
	before(function (done) {
		var serverDone = false;
		var clientDone = false;
		function checkIfDone () {
			if (serverDone && clientDone) {
				done();
			}
		}

		// Setup the WebSocket Server
		var server = http.createServer();
		server.listen(port, function() {
		    log('Server is listening on port ' + port);
		});

		var wsServer = new webSocket.server({ httpServer: server });
		wsServer.once('request', function(request) {
		    conn = request.accept('wishbanana', request.origin);
		    log('Connection from ' + conn.remoteAddress + ' accepted.');

		    // Reject all subsequent requests (there shouldn't be any, but just in case).
		    wsServer.on('request', function (request) {
		    	request.reject();
		    });

		    // Instatiate sServer and start testing
		    theServerSock = new sServer(conn);
		    serverDone = true;
		    checkIfDone();
		});

		// Setup the WebSocket Client
		var wsClient = new webSocket.client();
		wsClient.connect('ws://127.0.0.1:' + port, ['wishbanana']);
		wsClient.on('connect', function (conn) {
			theClientSock = new clientSock(conn);
			clientDone = true;
			checkIfDone();
		});
	});

	context('isOpen()', function () {
		it('should be true', function () {
			(theServerSock.isOpen()).should.be.true();
		});
	});

	context('namePlease()', function () {
		it('', function (done) {
			theClientSock.on('namePlease', function () {
				theClientSock.removeAllListeners('namePlease');
				done();
			});

			theServerSock.namePlease();
		});
	});

	context('matched()', function () {
		it('', function (done) {
			var theName = 'Peter';
			theClientSock.on('matched', function (name) {
				theClientSock.removeAllListeners('matched');
				(name).should.equal(theName);
				done();
			});

			theServerSock.matched(theName);
		});
	});

	context('countDown()', function () {
		it('', function (done) {
			var theValue = 100;
			theClientSock.on('countDown', function (value) {
				theClientSock.removeAllListeners('countDown');
				(value).should.equal(theValue);
				done();
			});

			theServerSock.countDown(theValue);
		});
	});

	context('gameOver()', function () {
		it('', function (done) {
			var theWin = true;
			theClientSock.on('gameOver', function (win) {
				theClientSock.removeAllListeners('gameOver');
				(win).should.equal(theWin);
				done();
			});

			theServerSock.gameOver(theWin);
		});
	});

	context('close()', function () {
		it('', function (done) {
			theClientSock.on('close', function () {
				theClientSock.removeAllListeners('close');
				done();
			});

			theServerSock.close();
		});
	});
});