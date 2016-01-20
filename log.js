'use strict';

var fs = require('fs');
var util = require('util');

// List of modules whose logs are not displayed.
var moduleFilter = {};
var levelFilter = 3;
var levelNames = ['ERROR', 'WARNING', 'INFO', 'DEBUG'];

module.exports = function createLogging (module, showModule, showLevel) {
    if (showModule === undefined) {
        showModule = true;
    }
    if (showLevel === undefined) {
        showLevel = true;
    }

    return {
        log: function (msg, level) {
            if (level === undefined) {
                level = 2;
            }

            if (!(module in moduleFilter) && level <= levelFilter) {
                var msgStr = '';
                if (showModule) {
                    msgStr += module + '::';
                }
                if (showLevel) {
                    msgStr += levelNames[level] + '::';
                }
                msgStr += msg;
                console.log(msgStr);
            }
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