// Wish Banana Referee
// referee.js
// Main game logic and message handling here.

//// Requires ////
var util = require('util');
var eventEmitter = require('events').EventEmitter;

//// Settings ////
var squeezeWinCount = 50;
var countDownStart = 5;

//// Export ////
module.exports.referee = function (server1, server2) {
	// Inherit from Events.EventEmitter.
	eventEmitter.call(this);

	//// Private Members ////
	var ref = this;

	function startGame () {
		var name1 = null;
		var name2 = null;

		function getName1 (name) {
			name1 = name;
			checkNames();
		}

		function getName2 (name) {
			name2 = name;
			checkNames();
		}

		function checkNames () {
			if (name1 != null && name2 != null) {
				server1.matched(name2);
				server2.matched(name1);

				server1.removeListener('name', getName1);
				server2.removeListener('name', getName2);

				ref.emit('gotName', name1, name2);
				startCountDown();
			}
		}

		server1.on('name', getName1);
		server2.on('name', getName2);

		server1.namePlease();
		server2.namePlease();
	}

	function startCountDown () {
		var value = countDownStart;

		var intervalID = setInterval(function () {
			server1.countDown(value);
			server2.countDown(value);

			if (value == 0) {
				clearInterval(intervalID);
				ref.emit('gameStart');
				playGame();
			}
			else {
				value--;
			}
		}, 1000);
	}

	function playGame () {
		function squeeze1 () {
			ref.squeezes1++
			if (ref.squeezes1 >= squeezeWinCount) {
				endGame(true);
			}
		}

		function squeeze2 () {
			ref.squeezes2++
			if (ref.squeezes2 >= squeezeWinCount) {
				endGame(false);
			}
		}

		function endGame(player1Won) {
			debugger;
			server1.removeListener('squeeze', squeeze1);
			server2.removeListener('squeeze', squeeze2);
			gameOver(player1Won);
		}

		server1.on('squeeze', squeeze1);
		server2.on('squeeze', squeeze2);
	}

	function gameOver(player1Won) {
		server1.gameOver(player1Won);
		server2.gameOver(!player1Won);

		server1.close(1000, 'Game over');
		server2.close(1000, 'Game over');

		ref.emit('gameOver');
	}

	// Public members
	this.name = server1.remoteAddress + "vs" + server2.remoteAddress;
	this.server1 = server1;
	this.server2 = server2;
	this.squeezes1 = 0;
	this.squeezes2 = 0;
	this.startGame = startGame;
};
util.inherits(module.exports.referee, eventEmitter);