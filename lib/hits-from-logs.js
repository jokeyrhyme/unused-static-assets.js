'use strict';

// Node.js built-ins

var fs = require('graceful-fs');
var path = require('path');

// 3rd-party modules

var async = require('async');
var Progress = require('progress');
var uniq = require('lodash.uniq');

// our modules

var hitsFromLog = require(path.join(__dirname, 'hits-from-log'));

// this module

function listFiles (dirPath) {
  return new Promise(function (resolve, reject) {
    fs.readdir(dirPath, function (err, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve(
        files.filter(function (file) {
          return file && file[0] !== '.';
        })
      );
    });
  });
}

module.exports = function (logsPath) {
  var allHits = [];
  return listFiles(logsPath).then(function (files) {
    var progress = new Progress(' [:bar] :percent :etas', {
      total: files.length
    });
    return new Promise(function (resolve, reject) {
      async.eachLimit(files, 250, function (file, done) {
        // iterator
        hitsFromLog(path.join(logsPath, file)).then(function (hits) {
          allHits.push.apply(allHits, hits);
          progress.tick();
          done();
        }, done);
      }, function (err) {
        // all done, or error
        if (err) {
          reject(err);
          return;
        }
        resolve(uniq(allHits));
      });
    });
  });
};
