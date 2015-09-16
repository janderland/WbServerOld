// Wish Banana
// Client To Server Connection Wrapper - NodeJS
// Wraps the server-to-client websocket connection, providing syntax sugar and convenience functions.
// NOTE: This is a NodeJS compatible version of the original C2SWrapper object used for testing purposes.

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var messages = require('../messages.js');

module.exports.C2SWrapper = function (conn) {
	// Inherit from EventEmitter
	EventEmitter.call(this);

	var thisWrapper = this;

	function sendMessage (msg) {
		conn.send(JSON.stringify(msg));
	}

	conn.on('message', function onMessage (rawMsg) {
		var msg;

		// We only accept messages of utf8 type because we only accept JSON message.
		if (rawMsg.type == 'utf8') {
			try {
				msg = JSON.parse(rawMsg.utf8Data);
			}
			catch (err) {
				thisWrapper.emit('receiveError', err, rawMsg.utf8Data);
				return;
			}

			var id = msg.id;
			if (id == messages.MESSAGE_ID.NamePlease) {
				thisWrapper.emit('namePlease');
			}
			else if (id == messages.MESSAGE_ID.Matched) {
				thisWrapper.emit('matched', msg.opponentName);
			}
			else if (id == messages.MESSAGE_ID.CountDown) {
				thisWrapper.emit('countDown', msg.value);
			}
			else if (id == messages.MESSAGE_ID.GameOver) {
				thisWrapper.emit('gameOver', msg.won);
			}
			else {
				thisWrapper.emit('receiveError', 'Invalid message type.', rawMsg.utf8Data);
			}
		}
		else {
			thisWrapper.emit('receiveError', 'Invalid rawMsg type: ' + rawMsg.type + '.', '');
		}
	});

	conn.on('close', function onClose () {
		thisWrapper.emit('close');
	});

	this.name = function (name) {
		sendMessage(new messages.Name(name));
	};

	this.squeeze = function () {
		sendMessage(new messages.Squeeze());
	};

	this.remoteAddress = conn.remoteAddress;
};
util.inherits(module.exports.C2SWrapper, EventEmitter);