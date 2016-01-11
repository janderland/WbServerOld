'use strict';

const logging = require('./log')('matchMaker'),
	  log = logging.log;

module.exports = function getMatchMaker (Client, Referee) {
	var waitingConn = null;

	return {
		referees: {},
		queueToPlay: function (conn) {
			if (!waitingConn) {
				log('Connection waiting.', logging.DEBUG);
				waitingConn = conn;
				return null;
			}
			else {
				var client1 = new Client(conn);
				var client2 = new Client(waitingConn);

				waitingConn = null;

				var ref = new Referee(client1, client2);
				this.referees[ref.name] = ref;

				log("Game started: " + ref.name);

				ref.once('gameOver', function onGameOver () {
					log('Game ended: ' + ref.name);
					delete this.referees[ref.name];
				});

				return ref;
			}
		}
	};
};