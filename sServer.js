// Wish Banana Socket Server
// sServer.js
// sServer wraps around a WebSocket-Node.WebSocketConnection object, providing message validation,
// and hooks for important events.

var eventEmitter = require('events').EventEmitter;

// The sServer constructor.
module.exports.sServer = function (conn) {
	// Inherit from Events.EventEmitter.
	eventEmitter.call(this);

	//// Private Members ////
	var server = this;

	function sendMessage(msg) {
		if (!server.isOpen()) {
			throw 'A connection has not yet been established with the game server.';
		}

		try {
			conn.send(JSON.stringify(msg));
		}
		catch (err) {
			server.emit('sendError', err, msg);
		}
	}

	conn.on('close', function (reasonCode, desc) {
		sever.emit('close');
	});

	conn.on('message', function (rawMsg) {
		var msg;

		// We only accept messages of utf8 type because we only accept JSON message.
		if (rawMsg.type == 'utf8') {
			try {
				msg = JSON.parse(rawMsg.utf8Data);
			}
			catch (err) {
				server.emit('receiveError', err, rawMsg.utf8Data);
				return;
			}

			server.emit('message', msg);

			var id = msg.Id;
			if (id == messages.msgIds.Name) {
				server.emit('name', msg.Name);
			}
			else if (id == messages.msgIds.Squeeze) {
				server.emit('squeeze');
			}
			else {
				server.emit('receiveError', 'Invalid message type.', rawMsg.utf8Data);
			}
		}
		else {
			server.emit('receiveError', 'Invalid rawMsg type: ' + rawMsg.type + '.', '');
		}
	});


	//// Public Members ////
	this.isOpen = function () {
		return conn.connected;
	};

	this.namePlease = function () {
		var msg = new msgs.namePlease();
		sendMessage(msg);
	};

	this.matched = function (opponentName) {
		var msg = new msgs.matched(opponentName);
		sendMessage(msg);
	};

	this.countDown = function (value) {
		var msg = new msgs.countDown(value);
		sendMessage(msg);
	};

	this.gameOver = function (win) {
		var msg = new msgs.gameOver(win);
		sendMessage(msg);
	};

	this.close = function (reasonCode, desc) {
		conn.drop(reasonCode, desc);
	};

	this.remoteAddress = conn.remoteAddress;
};