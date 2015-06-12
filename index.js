/*eslint-disable no-sync*/ // relax, this is a CLI tool

'use strict';

// Node.js built-ins

var fs = require('graceful-fs');
var path = require('path');

// 3rd-party modules

var diff = require('lodash.difference');
var program = require('commander');

// our modules

var hitsFromLogs = require(path.join(__dirname, 'lib', 'hits-from-logs'));
var listFiles = require(path.join(__dirname, 'lib', 'list-files'));

// this module

var pkg = require(path.join(__dirname, 'package.json'));

var logsPath;

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

listFiles().then(function (files) {
  console.log('total assets', files.length);

  return hitsFromLogs(logsPath).then(function (hits) {
    var unused = diff(files, hits);
    console.log('hits', hits);
    console.log('hits count', hits.length);
    console.log('unused', unused);
    console.log('unused count', unused.length);
  });
}).then(null, function (err) {
  console.error(err);
  process.exit(1);
});
