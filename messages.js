// Wish Banana
// Game Messages
// JavaScript objects representing the messages passed between client and server over a WebSocket connection.
// NOTE: This file is designed to be compatible in both a Node.js and web browser environment.

// Node.js support.
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function messagesModule () {
	var MESSAGE_ID = {
		Matched:    0,
		CountDown:  1,
		Squeeze:    2,
		GameOver:   3,
		Name:       4,
		NamePlease: 5
	};

	// Base Message Constructor
	function Message (type) {
		var id = MESSAGE_ID[type];

		// Make sure the type matches up with a valid id.
		if (typeof id == 'undefined') {
			throw type + ' is not a valid message type.';
		}

		this.id = id;
	}

	var NamePlease = function () {
		// Call the base constructor
		Message.call(this, 'NamePlease');
	};

	var Name = function (name) {
		// Call the base constructor
		Message.call(this, 'Name');

		this.name = name;
	};

	var Matched = function (opponentName) {
		// Call the base constructor
		Message.call(this, 'Matched');

		this.opponentName = opponentName;
	};

	var CountDown = function (value) {
		// Call the base constructor
		Message.call(this, 'CountDown');

		this.value = value;
	};

	var Squeeze = function () {
		//Call the base constructor
		Message.call(this, 'Squeeze');
	};

	var GameOver = function (won) {
		// Call the base constructor
		Message.call(this, 'GameOver');

		this.won = won;
	};

	return {
		Matched:	Matched,
		CountDown:	CountDown,
		Squeeze:	Squeeze,
		GameOver:	GameOver,
		Name:		Name,
		NamePlease:	NamePlease,
		MESSAGE_ID:	MESSAGE_ID
	};
});