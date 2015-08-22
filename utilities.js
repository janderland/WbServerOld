// Wish Banana Server Utilities
// utilities.js

define(function (require, exports, module) {
	//// Exports ////
	function log (msg) {
    	console.log((new Date()) + ' ' + msg)
	}

	exports = {
		log: log
	};
});