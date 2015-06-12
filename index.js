/*eslint-disable no-sync*/ // relax, this is a CLI tool

'use strict';

// Node.js built-ins

var childProcess = require('child_process');
var fs = require('graceful-fs');
var os = require('os');
var path = require('path');

// 3rd-party modules

var diff = require('lodash.difference');
var program = require('commander');
var Progress = require('progress');
var uniq = require('lodash.uniq');

// our modules

var listFiles = require(path.join(__dirname, 'lib', 'list-files'));

// this module

var pkg = require(path.join(__dirname, 'package.json'));

var MAX_WORKERS = Math.max(Math.floor(os.cpus().length * 0.75), 2);

var logsPath;

var currentWorker;

// arrays of filenames
var assets;
var logs;

// collected hits
var allHits = [];

var progress;
var nextBatch = 0;

var commands = {};

function finalise () {
  var unused;
  allHits = uniq(allHits);
  unused = diff(assets, allHits);
  console.log('unused', unused, unused.length);
  console.log('hits', allHits, allHits.length);
  process.exit(0);
}

function sendWork (worker) {
  var work = logs.slice(nextBatch, nextBatch + 50);
  nextBatch += 50;
  if (work.length) {
    worker.send({
      cmd: 'hits-from-logs',
      args: [ work ]
    });
    return;
  }
  worker.removeAllListeners('message');
  finalise();
}

commands['result:hits-from-logs'] = function (hits, numLogs) {
  var repeat;
  allHits.push.apply(allHits, hits);
  for (repeat = 0; repeat < numLogs; repeat += 1) {
    progress.tick();
  }
  sendWork(this);
};

program
.version(pkg.version)
.arguments('<logspath>')
.action(function (l) {
  logsPath = l;
})
.parse(process.argv);

if (!logsPath) {
  console.error('error: `logspath\' not specified');
  program.help();
  process.exit(1);
}
if (!fs.existsSync(logsPath)) {
  console.error('error: `logspath\' does not exist: ' + logsPath);
  program.help();
  process.exit(1);
}

Promise.all([
  listFiles.glob(),
  listFiles.flat(logsPath)
]).then(function (results) {
  assets = results[0];
  logs = results[1];

  progress = new Progress(' [:bar] :percent :etas', {
    total: logs.length
  });

  console.log('total assets', assets.length);
  console.log('total logs', logs.length);

  console.log('forking ' + MAX_WORKERS + ' times...');
  currentWorker = 0;
  while (currentWorker < MAX_WORKERS) {
    (function (worker) {
      worker.on('message', function (msg) {
        commands[msg.cmd].apply(worker, msg.args);
      });
      sendWork(worker);
    }(childProcess.fork(path.join(__dirname, 'lib', 'worker'))));
    currentWorker += 1;
  }

}).then(null, function (err) {
  console.error(err);
  process.exit(1);
});
