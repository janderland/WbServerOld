'use strict';

const logging = require('./log')('matchmaker'),
	  log = logging.log;

module.exports = function getMatchMaker (Client, NullClient, Referee) {
	var waitingConn = null;

	var onConnectionClose = function () {
		waitingConn = null;
	};

	return {
		referees: {},
		enqueue: function (conn) {
			const mp = !this.singleplayer,
			// Used to preserve the value of 'this' in ref event handlers.
			thisMatchMaker = this;

			if (mp && !waitingConn) {
				log(conn.remoteAddress + ' => Waiting for game.', logging.DEBUG);
				waitingConn = conn;
			}
			else {
				var client1 = new Client(conn);
				var client2 = (mp ? new Client(waitingConn) : new NullClient());

				waitingConn = null;

				var ref = new Referee(client1, client2);
				this.referees[ref.name] = ref;

				log(ref.name + " => Game started.");

				ref.once('gameOver', function onGameOver () {
					log(ref.name + ' => Game ended');
					delete thisMatchMaker.referees[ref.name];
				});

				ref.startGame();
			}
		},
		dequeue: function (conn) {
			if (waitingConn === conn) {
				waitingConn = null;
			}
		},
		singleplayer: false
	};
};