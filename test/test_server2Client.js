// Wish Banana
// Unit Test for server2Client.js

var http = require('http');
var webSocket = require('websocket');
var should = require('should');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var S2CWrapper = require('../server2Client.js').S2CWrapper;
var messages = require('../messages.js');

var port = 9090;

function log (msg) {
	console.log('\t' + msg);
}

describe('Server To Client WebSocket Wrapper', function testS2CWrapper () {
	var theS2CWrapper;
	var clientHelper;

	function WebSocketClientHelper (conn) {
		// Inherit from EventEmitter
		EventEmitter.call(this);

		var thisHelper = this;

		function sendMessage (msg) {
			try {
				conn.send(JSON.stringify(msg));
			}
			catch (err) {
				log(err);
			}
		}

		conn.on('message', function onClientMessage (rawMsg) {
			var msg;
			if (rawMsg.type == 'utf8') {
				msg = JSON.parse(rawMsg.utf8Data);

				if (msg.Id == messages.MESSAGE_ID.NamePlease) {
					thisHelper.emit('namePlease');
				}
				else if (msg.Id == messages.MESSAGE_ID.Matched) {
					thisHelper.emit('matched', msg.opponentName);
				}
				else if (msg.Id == messages.MESSAGE_ID.CountDown) {
					thisHelper.emit('countDown', msg.value);
				}
				else if (msg.Id == messages.MESSAGE_ID.GameOver) {
					thisHelper.emit('gameOver', msg.won);
				}
				else {
					throw new Error('Unknown message id: ' + msg.id);
				}
			}
			else {
				throw new Error('Received binary message.');
			}
		});

		conn.on('close', function onClientClose () {
			thisHelper.emit('close');
		});

		this.name = function (name) {
			sendMessage(new messages.Name(name));
		};

		this.squeeze = function () {
			sendMessage(new messages.Squeeze());
		};
	}
	util.inherits(WebSocketClientHelper, EventEmitter);

	before(function before (done) {
		var serverDone = false;
		var clientDone = false;

		function checkIfDone () {
			if (serverDone && clientDone) {
				done();
			}
		}

		var httpServer = http.createServer();
		httpServer.listen(port, function onHttpListening () {
		    log('Server is listening on port ' + port);
		});

		var webSocketServer = new webSocket.server({ httpServer: httpServer });
		webSocketServer.once('request', function onFirstRequestFromClient (request) {
		    var conn = request.accept('wishbanana', request.origin);
		    log('Connection from ' + conn.remoteAddress + ' accepted.');

		    theS2CWrapper = new S2CWrapper(conn);
		    serverDone = true;
		    checkIfDone();
		});

		var webSocketClient = new webSocket.client();
		webSocketClient.on('connect', function onConnectionToServer (conn) {
			clientHelper = new WebSocketClientHelper(conn);
			clientDone = true;
			checkIfDone();
		});
		webSocketClient.connect('ws://127.0.0.1:' + port, ['wishbanana']);
	});

	it('isOpen() should be true', function isOpenTest () {
		(theS2CWrapper.isOpen()).should.be.true();
	});

	it('namePlease()', function namePleaseTest (done) {
		clientHelper.once('namePlease', function () {
			done();
		});

		theS2CWrapper.namePlease();
	});

	it('matched()', function matchedTest (done) {
		var theName = 'Peter';
		clientHelper.once('matched', function (name) {
			(name).should.equal(theName);
			done();
		});

		theS2CWrapper.matched(theName);
	});

	it('countDown()', function countDownTest (done) {
		var theValue = 100;
		clientHelper.once('countDown', function (value) {
			(value).should.equal(theValue);
			done();
		});

		theS2CWrapper.countDown(theValue);
	});

	it('gameOver()', function gameOverTest (done) {
		var theWin = true;
		clientHelper.once('gameOver', function (win) {
			(win).should.equal(theWin);
			done();
		});

		theS2CWrapper.gameOver(theWin);
	});

	it('onName', function onNameTest (done) {
		var theName = 'Roger';
		theS2CWrapper.once('name', function onName (name) {
			(name).should.equal(theName);
			done();
		});

		clientHelper.name(theName);
	});

	it('onSqueeze', function onSqueezeTest (done) {
		theS2CWrapper.once('squeeze', function onSqueeze () {
			done();
		});

		clientHelper.squeeze();
	});

	it('close()', function closeTest (done) {
		clientHelper.once('close', function () {
			done();
		});

		theS2CWrapper.close();
	});
});