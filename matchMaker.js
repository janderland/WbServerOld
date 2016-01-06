// Wish Banana
// Match Maker
// Pairs up websocket connections and instantiates a game for each pair.

var logging = require('./log.js').getLoggingHandle('matchMaker');
var log = logging.log;
var Referee = require('./referee.js').Referee;
var Client = require('./server2Client.js').Client;

var waitingConn = null;
var Referees = {};

module.exports.queueToPlay = function (conn) {
	// Make sure the given conn isn't falsey. This would screw things up.
	if (!conn) {
		log('Given connection is falsey.', logging.WARNING);
		return null;
	}
	// Make sure the given conn isn't already waiting for a pair.
	if (waitingConn !== null && conn.remoteAddress === waitingConn.remoteAddress) {
		log('Given connection is already waiting.', logging.WARNING);
		return null;
	}
	else {
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
			Referees[ref.name] = ref;

			log(ref.name + " started.");
			ref.on('gameOver', function onRefGameOver () {
				log('Game ended: ' + ref.name);
				delete Referees[ref.name];
			});

			return ref;
		}
	}
};