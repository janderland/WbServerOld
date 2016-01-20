'use strict';

const util = require('util'),
	  EventEmitter = require('events').EventEmitter,

	  logging = require('./log.js')('referee'),
	  log = logging.log,

	  clickWinCount = process.env.WINCOUNT || 50,
	  countDownStart = process.env.COUNTDOWN || 5,
	  sendCountInterval = 300;

var Referee = function (client1, client2) {
	var player1,
		player2,
		countingIntervalId,
		sendCountIntervalId,
		thisReferee = this; // Used to preserve the value of 'this' in refLog().

	EventEmitter.call(this);

	var refLog = function (msg, level) {
		if (level === undefined) {
			level = logging.DEBUG;
		}
		log(thisReferee.name + ' => ' + msg, level);
	};

	var enterNamingState = function () {
		var checkNames = function () {
			if (player1.name !== undefined && player2.name !== undefined) {
				player1.matched(player2.name);
				player2.matched(player1.name);

				enterCountingState();
			}
		};

		player1.once('name', function createPlayer1 (name) {
			refLog('Player1 named ' + name + '.');
			player1.name = name;
			checkNames();
		});
		player2.once('name', function createPlayer2 (name) {
			refLog('Player 2 named ' + name + '.');
			player2.name = name;
			checkNames();
		});

		player1.winCount(clickWinCount);
		player2.winCount(clickWinCount);

		player1.namePlease();
		player2.namePlease();
		refLog('Waiting for names.');
	};

	var enterCountingState = function () {
		var value = countDownStart;

		countingIntervalId = setInterval(function countingDown () {
			refLog('Counting ' + value);
			player1.countDown(value);
			player2.countDown(value);

			if (value === 0) {
				clearInterval(countingIntervalId);
				enterGamingState();
			}
			else {
				value--;
			}
		}, 1000);
	};

	var enterGamingState = function () {
		var endGame = function (winningPlayer) {
			player1.removeListener('click', player1.click);
			player2.removeListener('click', player2.click);
			clearInterval(sendCountIntervalId);

			enterDoneState(winningPlayer === player1);
		};

		var click = function () {
			this.count++;
			if (this.count >= clickWinCount) {
				endGame(this);
			}
		};

		player1.click = player2.click = click;
		player1.on('click', player1.click);
		player2.on('click', player2.click);

		// Send updates on player progress to clients every so often.
		sendCountIntervalId = setInterval(function sendClickCount () {
			player1.clickCount(player1.count, player2.count);
			player2.clickCount(player2.count, player1.count);
		}, sendCountInterval);
	};

	var enterDoneState = function (player1Won) {
		var winner;

		// Because we don't know if this function was called
		// from a disconnect, we need to clear all possible
		// interval IDs and remove all listeners.
		clearInterval(countingIntervalId);
		clearInterval(sendCountIntervalId);
		player1.removeAllListeners();
		player2.removeAllListeners();

		if (player1Won) {
			winner = player1.name;
		}
		else {
			winner = player2.name;
		}
		refLog(winner + ' won!');

		player1.gameOver(player1Won);
		player2.gameOver(!player1Won);

		thisReferee.emit('gameOver');
	};

	var createPlayer = function (client) {
		var player = client;
		player.name = undefined;
		player.count = 0;
		return player;
	};

	var onPlayerClose = function () {
		// If a player's connection closes, the other player automatically wins.
		enterDoneState(this === player2);
	};

	player1 = createPlayer(client1);
	player2 = createPlayer(client2);

	player1.on('close', onPlayerClose);
	player2.on('close', onPlayerClose);

	this.player1 = player1;
	this.player2 = player2;
	this.name = player1.remoteAddress + 'vs' + player2.remoteAddress;
	this.startGame = enterNamingState;
};
util.inherits(Referee, EventEmitter);

module.exports = Referee;