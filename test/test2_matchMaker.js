'use strict';

const should = require('should'),
	  util = require('util'),
	  EventEmitter = require('events');

var matchMaker;

describe('MatchMaker', function testMatchMaker () {
	var conn1 = {
		remoteAddress: '1.1.1.1'
	};
	var conn2 = {
		remoteAddress: '2.2.2.2'
	};

	before(function before () {
		var Referee = function (server1, server2) {
			EventEmitter.call(this);
			this.name = server1.remoteAddress + "vs" + server2.remoteAddress;
		};
		util.inherits(Referee, EventEmitter);

		var Client = function (conn) {
			EventEmitter.call(this);
			this.remoteAddress = conn.remoteAddress;
		};
		util.inherits(Client, EventEmitter);

		matchMaker = require('../matchMaker')(Client, Referee);
	});

	it('Call with two valid connections', function validConnTest () {
		var ref = matchMaker.queueToPlay(conn1);
		should(ref).equal(null);

		ref = matchMaker.queueToPlay(conn2);
		should.exist(ref);
		(ref.name).should.equal('2.2.2.2vs1.1.1.1');
	});
});