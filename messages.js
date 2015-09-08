// Wish Banana Socket Messages
// messages.js

// The IDs of the different banana messages.
var msgIds = {
	Matched:    0,
	CountDown:  1,
	Squeeze:    2,
	GameOver:   3,
	Name:       4,
	NamePlease: 5
};

// Base message.
// msgType: (string) The type of message, defined by one of the keys in msgIds.
function msg (msgType) {
	var id = msgIds[msgType];

	// Make sure the msgType matches up with a valid id.
	if (typeof id == 'undefined') {
		throw msgType + ' is not a valid message type.';
	}

	this.Id = id;
}

function namePlease () {
	// Call the base constructor
	msg.call(this, 'NamePlease');
}

function name (name) {
	// Call the base constructor
	msg.call(this, 'Name');

	this.Name = name;
}

// Matched message.
// opponentName: (string) The opposing player's name.
function matched (opponentName) {
	// Call the base constructor
	msg.call(this, 'Matched');

	this.OpponentName = opponentName;
}

// CountDown message.
// value: (number) The current value of the countdown. E.g. 5, 4, 3, 2, 1, or 0.
function countDown (value) {
	// Call the base constructor
	msg.call(this, 'CountDown');

	this.Value = value;
}

// Squeeze message
function squeeze () {
	//Call the base constructor
	msg.call(this, 'Squeeze');
}

// GameOver message.
function gameOver (won) {
	// Call base constructor
	msg.call(this, 'GameOver');

	this.Won = won;
}


// Node.js support.
// This allows us to use the same message.js source file on both the client and server.
if (typeof module !== 'undefined') {
	module.exports = {
		matched: matched,
		countDown: countDown,
		squeeze: squeeze,
		gameOver: gameOver,
		name: name,
		namePlease: namePlease,
		msgIds: msgIds
	};
}