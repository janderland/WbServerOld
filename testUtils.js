// Wish Banana Testing Utilities
// testUtil.js
// Contains helper functions for assisting in testing the code.

var extend = require('node-extend');
var eventEmitter = require('eventemitter2').EventEmitter2;

var log = new eventEmitter({ wildcards:true });
log.writeLog = function (moduleName, log) {
	log.emit([moduleName, log]);
};

exports.log = log;