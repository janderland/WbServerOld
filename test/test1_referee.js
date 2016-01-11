'use strict';

const should = require('should'),
	  util = require('util'),
	  EventEmitter = require('events'),
	  Referee = require('../Referee'),

	  verbose = true;

describe('Referee', function testReferee () {
	var Client = function (name) {
		EventEmitter.call(this);
		var thisClient = this;

		function log (msg) {
			if (verbose) {
				console.log('\t' + name + ' -- ' + msg);
			}
		}

		function changeState(state) {
			if (thisClient.state === state - 1) {
				thisClient.state = state;
			}
			else {
				throw new Error(name + ' -- Invalid state change from ' + thisClient.state + ' to ' + state);
			}
		}

		this.namePlease = function () {
			changeState(1);
			thisClient.emit('name', name);
		};

		this.matched = function (opponentName) {
			changeState(2);
			log('matched with ' + opponentName);
		};

		this.countDown = function (value) {
			log(value);
			if (value === 0) {
				debugger;
				changeState(3);

				// Non-blocking while loop. e.g. while(thisClient.state < 4)...
				(function whileInState4 () {
					if (thisClient.state < 4) {
						thisClient.emit('click');

						process.nextTick(whileInState4);
					}
				})();
			}
		};

		this.gameOver = function (win) {
			changeState(4);
			thisClient.win = win;
		};

		this.close = function (reasonCode, desc) {
		};

		this.state = 0;
		this.win = false;
	};
	util.inherits(Client, EventEmitter);

	it('game simulation', function gameSimulationTest (done) {
		// Games currently take around 6s, so 8s should be enough time.
		this.timeout(8000);

		var name1 = 'Jon',
			name2 = 'Chris';

		// Instantiate the mock S2CWrapper instances.
		var client1 = new Client(name1);
		var client2 = new Client(name2);

		// After this test, display the final state, squeezes, and win status for each player.
		after(function afterGameSimulation () {
			var gameStates = ['naming', 'matching', 'counting', 'gaming', 'done'];
			if (verbose) {
				console.log('\t' + name1 + ' --- state: ' + gameStates[client1.state] +
					' | clicks: ' + ref.player1.clickCount + ' | win: ' + client1.win);

				console.log('\t' + name2 + ' --- state: ' + gameStates[client2.state] +
					' | clicks: ' + ref.player2.clickCount + ' | win: ' + client2.win);
			}
		});

		// Create the Referee, attach our listeners, and start the game.
		var ref = new Referee(client1, client2);
		ref.on('gameOver', function onGameOver () {
			if (client1.win) {
				(ref.player1.clickCount).should.be.greaterThan(ref.player2.clickCount);
			}
			else {
				(ref.player2.clickCount).should.be.lessThan(ref.player1.clickCount);
			}

			(client1.state).should.equal(4);
			(client2.state).should.equal(4);

			done();
		});
		ref.startGame();
	});
});