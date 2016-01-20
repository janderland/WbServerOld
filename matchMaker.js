'use strict';

const logging = require('./log')('matchmaker'),
	  log = logging.log;

module.exports = function getMatchMaker (Client, NullClient, Referee) {
	var waitingConn = null;

	return {
		referees: {},
		queueToPlay: function (conn) {
			const mp = !this.singleplayer,
				  // Used to preserve the value of 'this' in ref event handlers.
				  thisMatchMaker = this;

			if (mp && !waitingConn) {
				log('Connection waiting.', logging.DEBUG);
				waitingConn = conn;
				return null;
			}
			else {
				var client1 = new Client(conn);
				var client2 = (mp ? new Client(waitingConn) : new NullClient());

				waitingConn = null;

				var ref = new Referee(client1, client2);
				this.referees[ref.name] = ref;

				log("Game started => " + ref.name);

				ref.once('gameOver', function onGameOver () {
					log('Game ended => ' + ref.name);
					delete thisMatchMaker.referees[ref.name];
				});

				return ref;
			}
		},
		singleplayer: false
	};
};