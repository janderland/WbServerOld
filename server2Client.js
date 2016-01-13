'use strict';

const EventEmitter = require('events');
const util = require('util');

module.exports = function (messages) {
	var Client = function (conn) {
		// Used to preserve the 'this' value in the 'onMessage' handler.
		var thisClient = this;
		EventEmitter.call(this);

		var send = function (message) {
			conn.send(JSON.stringify(message));
		};

		conn.on('message', function onMessage (rawMessage) {
			var message;

			// We only accept raw messages of utf8 type.
			if (rawMessage.type == 'utf8') {
				try {
					message = JSON.parse(rawMessage.utf8Data);
				}
				catch (error) {
					thisClient.emit('error', error, rawMessage.utf8Data);
					return;
				}

				var id = message.id;
				if (id == messages.ids.Name) {
					thisClient.emit('name', message.name);
				}
				else if (id == messages.ids.Click) {
					thisClient.emit('click');
				}
				else {
					thisClient.emit('error', 'Invalid message ID.', rawMessage.utf8Data);
				}
			}
			else {
				thisClient.emit('error', 'Invalid rawMessage type.', util.inspect(rawMessage));
			}
		});

		conn.on('close', function onClose (reasonCode, description) {
			thisClient.emit('close', reasonCode, description);
		});

		this.winCount = function (count) {
			var message = new messages.WinCount(count);
			send(message);
		};

		this.namePlease = function () {
			var message = new messages.NamePlease();
			send(message);
		};

		this.matched = function (opponentName) {
			var message = new messages.Matched(opponentName);
			send(message);
		};

		this.countDown = function (value) {
			var message = new messages.CountDown(value);
			send(message);
		};

		this.clickCount = function (yourCount, theirCount) {
			var message = new messages.ClickCount(yourCount, theirCount);
			send(message);
		};

		this.gameOver = function (win) {
			var message = new messages.GameOver(win);
			send(message);
			conn.close(conn.CLOSE_REASON_NORMAL, 'Game over.');
		};

		this.drop = function () {
			conn.drop();
		};

		this.connected = conn.connected;
		this.remoteAddress = conn.remoteAddress;
	};
	util.inherits(Client, EventEmitter);

	var NullClient = function () {
		EventEmitter.call(this);
		var intervalId,
			thisClient = this;

		this.winCount = function () {};
		this.namePlease = function () {
			this.emit('name', 'NULL');
		};
		this.matched = function () {};
		this.countDown = function (count) {
			if (count === 0) {
				intervalId = setInterval(function nullClick () {
					thisClient.emit('click');
				}, 500);
			}
		};
		this.clickCount = function () {};
		this.gameOver = function () {
			clearInterval(intervalId);
		};
		this.drop = function () {};

		this.connected = true;
		this.remoteAddress = 'NULL';
	};
	util.inherits(NullClient, EventEmitter);

	return {
		Client: Client,
		NullClient: NullClient
	};
};