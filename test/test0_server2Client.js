// Wish Banana
// Unit Test for server2Client.js

var http = require('http');
var webSocket = require('websocket');
var should = require('should');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var S2CWrapper = require('../server2Client.js').S2CWrapper;
var C2SWrapper = require('./client2Server_node.js').C2SWrapper;
var messages = require('../messages.js');

var port = 9999;

function log (msg) {
	console.log('\t' + msg);
}

describe('Server To Client WebSocket Wrapper', function testS2CWrapper () {
	var httpServer;
	var webSocketServer;
	var webSocketClient;
	var theS2CWrapper;
	var theClient;

	before(function before (done) {
		var serverDone = false;
		var clientDone = false;

		function checkIfDone () {
			if (serverDone && clientDone) {
				done();
			}
		}

		httpServer = http.createServer();
		httpServer.listen(port, function onHttpListening () {
		    log('Server is listening on port ' + port);
		});

		webSocketServer = new webSocket.server({ httpServer: httpServer });
		webSocketServer.once('request', function onFirstRequestFromClient (request) {
		    var conn = request.accept('wishbanana', request.origin);
		    log('Connection from ' + conn.remoteAddress + ' accepted.');

		    theS2CWrapper = new S2CWrapper(conn);
		    serverDone = true;
		    checkIfDone();
		});

		webSocketClient = new webSocket.client();
		webSocketClient.on('connect', function onConnectionToServer (conn) {
			theClient = new C2SWrapper(conn);
			clientDone = true;
			checkIfDone();
		});
		webSocketClient.connect('ws://127.0.0.1:' + port, ['wishbanana']);
	});

	after(function after () {
		webSocketServer.shutDown();
		httpServer.close();
	});

	it('isOpen()', function isOpenTest () {
		(theS2CWrapper.isOpen()).should.be.true();
	});

	it('namePlease()', function namePleaseTest (done) {
		theClient.once('namePlease', function () {
			done();
		});

		theS2CWrapper.namePlease();
	});

	it('matched()', function matchedTest (done) {
		var theName = 'Peter';
		theClient.once('matched', function (name) {
			(name).should.equal(theName);
			done();
		});

		theS2CWrapper.matched(theName);
	});

	it('countDown()', function countDownTest (done) {
		var theValue = 100;
		theClient.once('countDown', function (value) {
			(value).should.equal(theValue);
			done();
		});

		theS2CWrapper.countDown(theValue);
	});

	it('gameOver()', function gameOverTest (done) {
		var theWin = true;
		theClient.once('gameOver', function (win) {
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

		theClient.name(theName);
	});

	it('onSqueeze', function onSqueezeTest (done) {
		theS2CWrapper.once('squeeze', function onSqueeze () {
			done();
		});

		theClient.squeeze();
	});

	it('close()', function closeTest (done) {
		theClient.once('close', function () {
			done();
		});

		theS2CWrapper.close();
	});
});