// Wish Banana
// Match Maker
// Pairs up websocket connections and instantiates a game for each pair.

var Referee = require('./referee.js').Referee;
var S2CWrapper = require('./server2Client.js').S2CWrapper;

function log (msg) {
	// TODO
	console.log(msg);
}

var waitingConn = null;
var Referees = {};

module.exports.queueToPlay = function (conn) {
	// Make sure the given conn isn't falsey. This would screw things up.
	if (!conn) {
		return null;
	}
	// Make sure the given conn isn't already waiting for a pair.
	if (waitingConn !== null && conn.remoteAddress === waitingConn.remoteAddress) {
		return null;
	}
	else {
		if (!waitingConn) {
			waitingConn = conn;
			return null;
		}
		else {
			var client1 = new S2CWrapper(conn);
			var client2 = new S2CWrapper(waitingConn);

			waitingConn = null;

			var ref = new Referee(client1, client2);
			Referees[ref.name] = ref;

			log(ref.name + " started.");
			ref.on('gameOver', function onRefGameOver () {
				log(ref.name + " ended.");
				delete Referees[ref.name];
			});

			return ref;
		}
	}
};