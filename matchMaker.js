// Wish Banana Game Match Maker
// matchMaker.js
// Pairs up websocket connections, wraps them in a sServer object, and start the
// game via the referee.

define(function (require, exports, module) {
	//// Requires ////
	var referee = require('./referee.js');
	var sServer = require('./sServer.js');
	var utilities = require('./utilities.js');
	var log = utilities.log;

	//// Private Members ////
	var waitingConn = null;

	var referees = [];

	//// Export ////
	exports = function (conn) {
		if (conn.remoteAddress == waitingConn.remoteAddress) {
			return;
		}
		else {
			if (!waitingConn) {
				waitingConn = conn;
			}
			else {
				var server1 = new sServer(conn);
				var server2 = new sServer(waitingConn);

				log("Paired up " + conn.remoteAddress + " and " + waitingConn.remoteAddress);

				waitingConn = null;

				var ref = new referee(server1, server2);
				referees.push(ref);

				ref.on('gameOver', function () {
					var i = referees.indexOf(ref);
					referees.splice(i, 1);
				});
			}
		}
	};
});