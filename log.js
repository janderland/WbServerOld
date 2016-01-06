// Wish Banana
// Log
// Sets up logging.

var moment = require('moment');
var fs = require('fs');
var util = require('util');

// List of modules whose logs are not displayed.
var moduleFilter = {};
var levelFilter = 3;
var levelNames = ['ERROR', 'WARNING', 'INFO', 'DEBUG'];
var log_stdout = process.stdout;

function getTime () { return moment().format('YYMMDD_HHmmss'); }

var name = getTime();
var dir = __dirname + '/logs/';
try {
	fs.mkdirSync(dir, '755');
}
catch (err) {
	// Rethrow all errors except 'dir already exists'.
	if (err.code) {
		if (err.code != 'EEXIST') {
			throw err;
		}
	}
	else {
		throw err;
	}
}
var log_file = fs.createWriteStream(dir+ name + '.log', {flags : 'w'});

// Overload the log function with out custom one.
console.log = function (msg) {
	var time = getTime() + ': ';
	log_file.write(time + util.format(msg) + '\n');
	log_stdout.write(time + util.format(msg) + '\n');
};

module.exports.getLoggingHandle = function (module, showLevel) {
    if (showLevel !== undefined) {
        showLevel = true;
    }

    return {
        log: function (msg, level) {
            if (level === undefined) {
                level = 2;
            }

            if (!(module in moduleFilter) && level <= levelFilter) {
                var msgStr = moment().format('MM/DD/YY HH:MM');
                if (showLevel) {
                    msgStr += ' ' + levelNames[level];
                }
                msgStr += ' ' + msg + '\n';
                console.log(msgStr);
            }
        },
        stringify: function (obj) {
            var string = '';
            try {
                string = JSON.stringify(obj);
            }
            catch (e) {
                this.log('Failed to stringify object.', this.WARNING);
                string = typeof obj;
            }
            return string;
        },
        filter: function (filters) {
            if (filters.module !== undefined) {
                for (var m in filters.module) {
                    if (filters.module[m]) {
                        moduleFilter[m] = true;
                    }
                    else {
                        delete moduleFilter[m];
                    }
                }
            }

            if (filters.level !== undefined) {
                levelFilter = filters.level;
            }
        },
        ERROR: 0,
        WARNING: 1,
        INFO: 2,
        DEBUG: 3
    };
};