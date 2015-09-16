// Wish Banana
// Unit Test for Referee.js

var should = require('should');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Referee = require('../Referee.js').Referee;

var verbose = true;

describe('Referee', function testReferee () {
	// Mock S2CWrapper
	var S2CWrapper = function (name) {
		// Run the EventEmitter constructor on this.
		EventEmitter.call(this);

		var isOpen = true;
		var thisWrapper = this;

		function log (msg) {
			if (verbose) {
				console.log('\t' + name + ' -- ' + msg);
			}
		}

		// changeState() ensures that we step through every state in order.
		function changeState(state) {
			if (thisWrapper.state === state - 1) {
				thisWrapper.state = state;
			}
			else {
				throw new Error(name + ' -- Invalid state change from ' + thisWrapper.state + ' to ' + state);
			}
		}

		/// Mocked members ///

		this.isOpen = function () {
			return isOpen;
		};

		this.namePlease = function () {
			changeState(1);
			thisWrapper.emit('name', name);
		};

		this.matched = function (opponentName) {
			changeState(2);
			log('matched with ' + opponentName);
		};

		this.countDown = function (value) {
			log(value);
			if (value === 0) {
				changeState(3);

				// Non-blocking while loop. e.g. while(thisWrapper.state < 4)...
				(function () {
					if (thisWrapper.state < 4) {
						thisWrapper.emit('squeeze');

						process.nextTick(arguments.callee);
					}
				})();
			}
		};

		this.gameOver = function (win) {
			changeState(4);
			thisWrapper.win = win;
		};

		this.close = function (reasonCode, desc) {
			isOpen = false;
		};

		this.state = 0;
		this.win = false;
	};
	util.inherits(S2CWrapper, EventEmitter);

	it('game simulation', function gameSimulationTest (done) {
		// Games currently take around 6s, so 8s should be enough time.
		this.timeout(8000);

		// Instantiate the mock S2CWrapper instances.
		var client1 = new S2CWrapper('client1');
		var client2 = new S2CWrapper('client2');

		// After this test, display the final state, squeezes, and win status for each player.
		after(function afterGameSimulation () {
			var gameStates = ['naming', 'matching', 'counting', 'gaming', 'done'];
			if (verbose) {
				console.log('\tclient1 --- state: ' + gameStates[client1.state] +
					' | squeezes: ' + ref.squeezes1 + ' | win: ' + client1.win);

				console.log('\tclient2 --- state: ' + gameStates[client2.state] +
					' | squeezes: ' + ref.squeezes2 + ' | win: ' + client2.win);
			}
		});

		// Create the Referee, attach our listeners, and start the game.
		var ref = new Referee(client1, client2);
		ref.on('gameOver', function () {
			if (client1.win) {
				(ref.squeezes1).should.be.greaterThan(ref.squeezes2);
			}
			else {
				(ref.squeezes1).should.be.lessThan(ref.squeezes2);
			}

			(client1.state).should.equal(4);
			(client2.state).should.equal(4);

			done();
		});
		ref.startGame();
	});
});