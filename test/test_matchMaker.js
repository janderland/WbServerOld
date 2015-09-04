// Unit Test - Match Maker

var should = require('should');
var rewire = require('rewire');
var util = require('util');
var eventEmitter = require('events').EventEmitter;
var matchMaker = rewire('../matchMaker.js');

// Test
describe('matchMaker', function () {
	var conn1 = {
		remoteAddress: '1.1.1.1'
	};
	var conn2 = {
		remoteAddress: '2.2.2.2'
	};
	var conn3 = {
		remoteAddress: '3.3.3.3'
	};

	before(function () {
		// Mock Referee
		var referee = function (server1, server2) {
			// Inherit the members of Event Emitter.
			eventEmitter.call(this);

			this.Name = server1.remoteAddress + "vs" + server2.remoteAddress;
		};
		util.inherits(referee, eventEmitter);

		// Mock sServer
		var sServer = function (conn) {
			// Inherit the members of Event Emitter.
			eventEmitter.call(this);

			this.remoteAddress = conn.remoteAddress;
		};
		util.inherits(sServer, eventEmitter);

		var log = function (log) {};

		// Inject the mocked referee and sServer.
		matchMaker.__set__({
			referee: referee,
			sServer: sServer,
			log: log
		});
	});

	context('Call with null connection', function () {
		it('should return null', function () {
			var ref = matchMaker.match(null);
			should(ref).equal(null);
		});
	});

	context('Call with two valid connections', function () {
		it('should return create referee for the game', function () {
			var ref = matchMaker.match(conn1);
			should(ref).equal(null);

			ref = matchMaker.match(conn2);
			should.exist(ref);
			ref.Name.should.equal('2.2.2.2vs1.1.1.1');
		});
	});

	context('Call with two identical connections', function () {
		it('should return null', function () {
			var ref = matchMaker.match(conn3);
			should(ref).equal(null);

			ref = matchMaker.match(conn3);
			should(ref).equal(null);
		});
	});
});