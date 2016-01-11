'use strict';

var http = require('http');
var webSocket = require('websocket');
var should = require('should');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var messages = require('../messages');
var Server = require('./client2Server_node')(messages);
var Client = require('../server2Client')(messages);

var port = 9999;

describe('Server To Client WebSocket Wrapper', function testS2CWrapper () {
	var httpServer;
	var webSocketServer;
	var webSocketClient;
	var server2Client;
	var client2Server;
	var remoteAddress;

	var checkIfDone;
	var connect = function (complete) {
		checkIfDone = function () {
			if (server2Client !== undefined && client2Server !== undefined) {
				complete();
			}
		};

		webSocketClient.connect('ws://127.0.0.1:' + port, ['wishbanana']);
	};

	before(function before (done) {
		httpServer = http.createServer();
		httpServer.listen(port, function onHttpListening () {});

		webSocketServer = new webSocket.server({ httpServer: httpServer });
		webSocketServer.on('request', function onConnectionFromClient (request) {
		    var conn = request.accept('wishbanana', request.origin);
		    remoteAddress = conn.remoteAddress;
		    server2Client = new Client(conn);
		    checkIfDone();
		});

		webSocketClient = new webSocket.client();
		webSocketClient.on('connect', function onConnectionToServer (conn) {
			client2Server = new Server(conn);
			checkIfDone();
		});

		connect(done);
	});

	after(function after () {
		webSocketServer.shutDown();
		httpServer.close();
	});

	it('connected', function connectedTest () {
		(server2Client.connected).should.be.true();
	});

	it('remoteAddress', function remoteAddressTest () {
		(server2Client.remoteAddress).should.equal(remoteAddress);
	});

	it('namePlease()', function namePleaseTest (done) {
		client2Server.once('namePlease', function () {
			done();
		});

		server2Client.namePlease();
	});

	it('matched()', function matchedTest (done) {
		var theName = 'Peter';
		client2Server.once('matched', function (name) {
			(name).should.equal(theName);
			done();
		});

		server2Client.matched(theName);
	});

	it('countDown()', function countDownTest (done) {
		var theValue = 100;
		client2Server.once('countDown', function (value) {
			(value).should.equal(theValue);
			done();
		});

		server2Client.countDown(theValue);
	});

	it('onName', function onNameTest (done) {
		var theName = 'Roger';
		server2Client.once('name', function onName (name) {
			(name).should.equal(theName);
			done();
		});

		client2Server.name(theName);
	});

	it('onClick', function onClickTest (done) {
		server2Client.once('click', function onClick () {
			done();
		});

		client2Server.click();
	});

	it('gameOver()', function gameOverTest (done) {
		debugger;
		this.timeout(5000);
		var theWin = true;
		var gameOverRecievedFirst = false;

		client2Server.once('gameOver', function (win) {
			gameOverRecievedFirst = true;
			(win).should.equal(theWin);
		});

		client2Server.once('close', function (reasonCode, description) {
			(gameOverRecievedFirst).should.be.true;
			(description).should.equal('Game over.');
			done();
		});

		server2Client.gameOver(theWin);
	});

	it('drop()', function dropTest (done) {
		this.timeout(5000);
		connect(function connectComplete () {
			client2Server.once('close', function (reasonCode, description) {
				done();
			});

			server2Client.drop();
		});
	});
});