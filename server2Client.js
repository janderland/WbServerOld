// Wish Banana
// Server To Client Connection Wrapper
// Wraps the server-to-client websocket connection, providing syntax sugar and convenience functions.

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var messages = require('./messages.js');

// S2CWrapper Constructor
module.exports.S2CWrapper = function (conn) {
	// Inherit from Events.EventEmitter.
	EventEmitter.call(this);

	var thisWrapper = this;

	function sendMessage (msg) {
		conn.send(JSON.stringify(msg));
	}

	conn.on('close', function onClose (reasonCode, desc) {
		thisWrapper.emit('close', reasonCode, desc);
	});

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

			thisWrapper.emit('message', msg);

			var id = msg.Id;
			if (id == messages.MESSAGE_ID.Name) {
				thisWrapper.emit('name', msg.name);
			}
			else if (id == messages.MESSAGE_ID.Squeeze) {
				thisWrapper.emit('squeeze');
			}
			else {
				thisWrapper.emit('receiveError', 'Invalid message type.', rawMsg.utf8Data);
			}
		}
		else {
			thisWrapper.emit('receiveError', 'Invalid rawMsg type: ' + rawMsg.type + '.', '');
		}
	});

	this.isOpen = function () {
		return conn.connected;
	};

	this.namePlease = function () {
		var msg = new messages.NamePlease();
		sendMessage(msg);
	};

	this.matched = function (opponentName) {
		var msg = new messages.Matched(opponentName);
		sendMessage(msg);
	};

	this.countDown = function (value) {
		var msg = new messages.CountDown(value);
		sendMessage(msg);
	};

	this.gameOver = function (win) {
		var msg = new messages.GameOver(win);
		sendMessage(msg);
	};

	this.close = function (reasonCode, desc) {
		conn.drop(reasonCode, desc);
	};

	this.remoteAddress = conn.remoteAddress;
};
util.inherits(module.exports.S2CWrapper, EventEmitter);