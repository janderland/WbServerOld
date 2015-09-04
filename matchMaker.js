// Wish Banana Game Match Maker
// matchMaker.js
// Pairs up websocket connections, wraps them in a sServer object, and start the
// game via the referee.

//// Requires ////
var referee = require('./referee.js').referee;
var sServer = require('./sServer.js').sServer;
var utilities = require('./utilities.js');
var log = utilities.log;

//// Private Members ////
var waitingConn = null;

var referees = {};

//// Export ////
// match(conn)
// If a pair is available, pair up the connections and start their game. If a pair isn't available, 
// the connection is placed in a waiting list to be paired.
// conn - The connection to be paired.
// Returns - Null if the connection wasn't yet paired. Otherwise, returns the referee representing the game for the pair.
module.exports.match = function (conn) {
	// Make sure input isn't a null/undefined/false/empty string. This would screw things up.
	if (!conn) {
		return null;
	}
	if (waitingConn != null && conn.remoteAddress == waitingConn.remoteAddress) {
		return null;
	}
	else {
		if (!waitingConn) {
			waitingConn = conn;
			return null;
		}
		else {
			var server1 = new sServer(conn);
			var server2 = new sServer(waitingConn);

			waitingConn = null;

			var ref = new referee(server1, server2);
			referees[ref.name] = ref;

			log(ref.name + " started.");
			ref.on('gameOver', function () {
				log(ref.name + " ended.");
				delete referees[ref.name];
			});

			return ref;
		}
	}
};