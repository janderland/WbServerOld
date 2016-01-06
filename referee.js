// Wish Banana
// Referee
// Represents a game between two clients. Encompasses all game logic.

var logging = require('./log.js').getLoggingHandle('referee');
var log = logging.log;
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var clickWinCount = 50;
var countDownStart = 5;

// Referee Constructor
module.exports.Referee = function (client1, client2) {
	// Inherit from Events.EventEmitter.
	EventEmitter.call(this);

	var player1 = new Player(client1);
	var player2 = new Player(client2);
	var refName = client1.remoteAddress + "vs" + client2.remoteAddress;

	function refLog (msg, level) {
		if (level === undefined) {
			level = logging.DEBUG;
		}
		log(refName + ' => ' + msg, level);
	}

	function Player (client) {
		this.clicks = 0;
		this.client = client;
		this.name = undefined;

		this.click = function () {
			this.clicks++;
			refLog(playerName + ' ' + clicks);
			return this.clicks;
		};
	}

	function enterNamingState () {
		function checkPlayers () {
			if (player1 !== undefined && player2 !== undefined) {
				client1.matched(player2.getName());
				client2.matched(player1.getName());

				enterCountingState();
			}
		}

		client1.once('name', function createPlayer1 (name) {
			refLog('Got a name.');
			player1 = new Player(client1, name);
			checkPlayers();
		});
		client2.once('name', function createPlayer2 (name) {
			refLog('Got a name.');
			player2 = new Player(client2, name);
			checkPlayers();
		});

		client1.namePlease();
		client2.namePlease();
		refLog('Waiting for names.');
	}

	function enterCountingState () {
		var value = countDownStart;

		var intervalID = setInterval(function countingDown () {
			refLog('Counting ' + value);
			client1.countDown(value);
			client2.countDown(value);

			if (value === 0) {
				clearInterval(intervalID);
				enterGamingState();
			}
			else {
				value--;
			}
		}, 1000);
	}

	function enterGamingState () {
		function endGame(player1Won) {
			// TODO - Can we still removed the listeners.
			client1.removeListener('click', squeeze1);
			client2.removeListener('click', squeeze2);
			enterDoneState(player1Won);
		}

		client1.on('click', function click1 () {
			if (player1.click() >= clickWinCount) {
				endGame(true);
			}
		});
		client2.on('click', function click2 () {
			if (player2.click() >= clickWinCount) {
				endGame(false);
			}
		});
	}

	function enterDoneState(player1Won) {
		var winner;
		if (player1Won) {
			winner = player1.getName();
		}
		else {
			winner = player2.getName();
		}
		refLog(winner + ' won!');

		client1.gameOver(player1Won);
		client2.gameOver(!player1Won);

		client1.close(1000, 'Game over');
		client2.close(1000, 'Game over');

		ref.emit('gameOver');
	}

	this.player1 = player1;
	this.player2 = player2;
	this.getName = function () {
		return refName;
	};
	this.startGame = enterNamingState;

	log('New game created: ' + this.name);
};
util.inherits(module.exports.Referee, EventEmitter);