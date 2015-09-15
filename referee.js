// Wish Banana
// Referee
// Represents a game between two clients. Encompasses all game logic.

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var squeezeWinCount = 50;
var countDownStart = 5;

// Referee Constructor
module.exports.Referee = function (client1, client2) {
	// Inherit from Events.EventEmitter.
	EventEmitter.call(this);

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
			if (name1 !== null && name2 !== null) {
				client1.matched(name2);
				client2.matched(name1);

				startCountDown();
			}
		}

		client1.once('name', getName1);
		client2.once('name', getName2);

		client1.namePlease();
		client2.namePlease();
	}

	function startCountDown () {
		var value = countDownStart;

		var intervalID = setInterval(function countingDown () {
			client1.countDown(value);
			client2.countDown(value);

			if (value === 0) {
				clearInterval(intervalID);
				playGame();
			}
			else {
				value--;
			}
		}, 1000);
	}

	function playGame () {
		function squeeze1 () {
			ref.squeezes1++;
			if (ref.squeezes1 >= squeezeWinCount) {
				endGame(true);
			}
		}

		function squeeze2 () {
			ref.squeezes2++;
			if (ref.squeezes2 >= squeezeWinCount) {
				endGame(false);
			}
		}

		function endGame(player1Won) {
			client1.removeListener('squeeze', squeeze1);
			client2.removeListener('squeeze', squeeze2);
			gameOver(player1Won);
		}

		client1.on('squeeze', squeeze1);
		client2.on('squeeze', squeeze2);
	}

	function gameOver(player1Won) {
		client1.gameOver(player1Won);
		client2.gameOver(!player1Won);

		client1.close(1000, 'Game over');
		client2.close(1000, 'Game over');

		ref.emit('gameOver');
	}

	// Public members
	this.name = client1.remoteAddress + "vs" + client2.remoteAddress;
	this.client1 = client1;
	this.client2 = client2;
	this.squeezes1 = 0;
	this.squeezes2 = 0;
	this.startGame = startGame;
};
util.inherits(module.exports.Referee, EventEmitter);