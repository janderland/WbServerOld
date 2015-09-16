// Wish Banana
// Game Messages
// JavaScript objects representing the messages passed between client and server over a WebSocket connection.
// NOTE: This file is designed to be compatible in both a Node.js and web browser environment.

var MESSAGE_ID = {
	Matched:    0,
	CountDown:  1,
	Squeeze:    2,
	GameOver:   3,
	Name:       4,
	NamePlease: 5
};

// Message Constructors
var NamePlease;
var Name;
var Matched;
var CountDown;
var Squeeze;
var GameOver;

(function private () {
	// Base Message Constructor
	function Message (type) {
		var id = MESSAGE_ID[type];

		// Make sure the type matches up with a valid id.
		if (typeof id == 'undefined') {
			throw type + ' is not a valid message type.';
		}

		this.id = id;
	}

	NamePlease = function () {
		// Call the base constructor
		Message.call(this, 'NamePlease');
	};

	Name = function (name) {
		// Call the base constructor
		Message.call(this, 'Name');

		this.name = name;
	};

	Matched = function (opponentName) {
		// Call the base constructor
		Message.call(this, 'Matched');

		this.opponentName = opponentName;
	};

	CountDown = function (value) {
		// Call the base constructor
		Message.call(this, 'CountDown');

		this.value = value;
	};

	Squeeze = function () {
		//Call the base constructor
		Message.call(this, 'Squeeze');
	};

	GameOver = function (won) {
		// Call the base constructor
		Message.call(this, 'GameOver');

		this.won = won;
	};
})();

// Node.js support.
if (typeof module !== 'undefined') {
	module.exports = {
		Matched:	Matched,
		CountDown:	CountDown,
		Squeeze:	Squeeze,
		GameOver:	GameOver,
		Name:		Name,
		NamePlease:	NamePlease,
		MESSAGE_ID:	MESSAGE_ID
	};
}