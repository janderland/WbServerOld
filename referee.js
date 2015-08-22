// Wish Banana Referee
// referee.js
// Main game logic and message handling here.

define(function (require, exports, module) {
	//// Requires ////
	var eventEmitter = require('events').EventEmitter;
	var messages = require('./messages.js');
	var utilities = require('./utilities.js');
	var log = utilities.log;

	//// Export ////
	exports = function (server1, server2) {
		// Inherit from Events.EventEmitter.
		eventEmitter.call(this);

		//// Private Members ////
		var ref = this;
		var squeezeWinCount = 20;

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

					startCountDown();
				}
			}

			server1.on('name', getName1);
			server2.on('name', getName2);

			server1.namePlease();
			server2.namePlease();
		}

		function startCoundDown () {
			var value = 5;

			var intervalID = setInterval(function () {
				server1.countDown(value);
				server2.countDown(value);

				if (value == 0) {
					clearInterval(intervalID);
					playGame();
				}
				else {
					value--;
				}
			}, 1000);
		}

		function playGame () {
			var squeezeCount1 = 0;
			var squeezeCount2 = 0;

			function squeeze1 () {
				squeezeCount1++
				if (squeezeCount1 >= squeezeWinCount) {
					endGame(true);
				}
			}

			function squeeze2 () {
				squeezeCount2++
				if (squeezeCount2 >= squeezeWinCount) {
					endGame(false);
				}

			}

			function endGame(player1Won) {
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

			// TODO - add proper codes and description.
			server1.close();
			server2.close();
		}

		// Game entry point.
		startGame();
	};
});