// Unit Test - Referee

var should = require('should');
var util = require('util');
var eventEmitter = require('events').EventEmitter;
var referee = require('../referee.js').referee;

describe('referee', function () {
	// Mock sServer
	var sServer = function (name) {
		// Run the EventEmitter constructor on this.
		eventEmitter.call(this);

		var isOpen = true;
		var server = this;

		// sLog - Used for logging sServer details during the testing.
		function sLog (log) {
			console.log('\t' + name + ' -- ' + log);
		}

		// changeState(state) - Ensures the given state is a valid state to transition
		// to. If so, the state value is updated. Otherwise, an exception is thrown.
		// state - (int) The state to transition to.
		function changeState(state) {
			if (server.state == state - 1) {
				server.state = state;
			}
			else {
				throw new Error(name + ' -- Invalid state change from ' + server.state + ' to ' + state);
			}
		}

		/// Mocked members ///

		this.isOpen = function () {
			return isOpen;
		};

		this.namePlease = function () {
			changeState(1);
			server.emit('name', name);
		};

		this.matched = function (opponentName) {
			changeState(2);
			sLog('matched with ' + opponentName);
		};

		this.countDown = function (value) {
			sLog(value);
			if (value == 0) {
				changeState(3);

				// Non-blocking while loop. e.g. while(server.state < 4)...
				(function () {
					if (server.state < 4) {
						server.emit('squeeze');

						process.nextTick(arguments.callee);
					}
				})();
			}
		};

		this.gameOver = function (win) {
			changeState(4);
			server.win = win;
		};

		this.close = function (reasonCode, desc) {
			isOpen = false
		};

		this.state = 0;
		this.win = false;
	};
	util.inherits(sServer, eventEmitter);
	

	context('game simulation', function () {
		it('', function (done) {
			// Games currently take around 6s, so 8s should be enough time.
			this.timeout(8000);

			// Instantiate the mock sServer instances.
			var server1 = new sServer('server1');
			var server2 = new sServer('server2');

			// After this test, display the final state, squeezes, and win status for each player.
			after(function () {
				var gameStates = ['naming', 'matching', 'counting', 'gaming', 'done'];
				console.log('\tServer1 --- state: ' + gameStates[server1.state] + ' | squeezes: ' + ref.squeezes1 + ' | win: ' + server1.win);
				console.log('\tServer2 --- state: ' + gameStates[server2.state] + ' | squeezes: ' + ref.squeezes2 + ' | win: ' + server2.win);
			});

			// Create the referee, attach our listeners, and start the game.
			var ref = new referee(server1, server2);
			ref.on('gameOver', function () {
				if (server1.win) {
					(ref.squeezes1).should.be.greaterThan(ref.squeezes2);
				}
				else {
					(ref.squeezes1).should.be.lessThan(ref.squeezes2);
				}

				(server1.state).should.equal(4);
				(server2.state).should.equal(4);

				done();
			});
			ref.startGame();
		});
	});
});