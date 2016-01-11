'use strict';

var util = require('util');
var EventEmitter = require('events');

module.exports = function (messages) {
	var Server = function (conn) {
		// Used to preserve the 'this' value in the 'onMessage' handler.
		var thisServer = this;
		EventEmitter.call(this);

		var sendMessage = function (message) {
			conn.send(JSON.stringify(message));
		};

		conn.on('message', function onMessage (rawMessage) {
			var message;

			// We only accept messages of utf8 type.
			if (rawMessage.type == 'utf8') {
				try {
					message = JSON.parse(rawMessage.utf8Data);
				}
				catch (error) {
					thisServer.emit('error', error, rawMessage.utf8Data);
					return;
				}

				var id = message.id;
				if (id == messages.ids.NamePlease) {
					thisServer.emit('namePlease');
				}
				else if (id == messages.ids.Matched) {
					thisServer.emit('matched', message.opponentName);
				}
				else if (id == messages.ids.CountDown) {
					thisServer.emit('countDown', message.value);
				}
				else if (id == messages.ids.GameOver) {
					thisServer.emit('gameOver', message.won);
				}
				else {
					thisServer.emit('error', 'Invalid message ID.', rawMessage.utf8Data);
				}
			}
			else {
				thisServer.emit('error', 'Invalid rawMessage type.', util.inspect(rawMessage));
			}
		});

		conn.on('close', function onClose (reasonCode, description) {
			thisServer.emit('close', reasonCode, description);
		});

		this.name = function (name) {
			sendMessage(new messages.Name(name));
		};

		this.click = function () {
			sendMessage(new messages.Click());
		};

		this.remoteAddress = conn.remoteAddress;
	};
	util.inherits(Server, EventEmitter);

	return Server;
};