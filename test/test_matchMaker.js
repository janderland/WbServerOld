// Wish Banana
// Unit Test for matchMaker.js

var should = require('should');
var rewire = require('rewire');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var matchMaker = rewire('../matchMaker.js');

// Test
describe('Match Maker', function testMatchMaker () {
	var conn1 = {
		remoteAddress: '1.1.1.1'
	};
	var conn2 = {
		remoteAddress: '2.2.2.2'
	};
	var conn3 = {
		remoteAddress: '3.3.3.3'
	};

	before(function before () {
		// Mock Referee
		var Referee = function (server1, server2) {
			// Inherit from EventEmitter.
			EventEmitter.call(this);

			this.name = server1.remoteAddress + "vs" + server2.remoteAddress;
		};
		util.inherits(Referee, EventEmitter);

		// Mock S2CWrapper
		var S2CWrapper = function (conn) {
			// Inherit from EventEmitter.
			EventEmitter.call(this);

			this.remoteAddress = conn.remoteAddress;
		};
		util.inherits(S2CWrapper, EventEmitter);

		var log = function (msg) {
			console.log('\t' + msg);
		};

		// Inject the mocked Referee and S2CWrapper.
		matchMaker.__set__({
			Referee: Referee,
			S2CWrapper: S2CWrapper,
			log: log
		});
	});

	it('Call with null', function callWithNullTest () {
		var ref = matchMaker.queueToPlay(null);
		should(ref).equal(null);
	});

	it('Call with two valid connections', function validConnTest () {
		var ref = matchMaker.queueToPlay(conn1);
		should(ref).equal(null);

		ref = matchMaker.queueToPlay(conn2);
		should.exist(ref);
		ref.name.should.equal('2.2.2.2vs1.1.1.1');
	});

	it('Call with two identical connections', function identicalConnTest () {
		var ref = matchMaker.queueToPlay(conn3);
		should(ref).equal(null);

		ref = matchMaker.queueToPlay(conn3);
		should(ref).equal(null);
	});
});