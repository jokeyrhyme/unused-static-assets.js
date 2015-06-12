'use strict';

// Node.js built-ins

var path = require('path');

// our modules

var hitsFromLogs = require(path.join(__dirname, 'hits-from-logs'));

// this module

var commands = {};

commands['hits-from-logs'] = function (logPaths) {
  hitsFromLogs(logPaths).then(function (hits) {
    process.send({
      cmd: 'result:hits-from-logs',
      args: [ hits, logPaths.length ]
    });
  });
};

process.on('message', function (msg) {
  commands[msg.cmd].apply(null, msg.args);
});
