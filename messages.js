'use strict';

// Node.js support.
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function messagesModule () {
	var ids = {
		Matched:    0,
		CountDown:  1,
		Click:      2,
		GameOver:   3,
		Name:       4,
		NamePlease: 5
	};

	var Message = function (type) {
		this.id = ids[type];
	};

	var NamePlease = function () {
		Message.call(this, 'NamePlease');
	};

	var Name = function (name) {
		Message.call(this, 'Name');
		this.name = name;
	};

	var Matched = function (opponentName) {
		Message.call(this, 'Matched');
		this.opponentName = opponentName;
	};

	var CountDown = function (value) {
		Message.call(this, 'CountDown');
		this.value = value;
	};

	var Click = function () {
		Message.call(this, 'Click');
	};

	var GameOver = function (won) {
		Message.call(this, 'GameOver');
		this.won = won;
	};

	return {
		Matched:	Matched,
		CountDown:	CountDown,
		Click:	    Click,
		GameOver:	GameOver,
		Name:		Name,
		NamePlease:	NamePlease,
		ids:	    ids
	};
});