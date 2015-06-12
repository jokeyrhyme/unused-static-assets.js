'use strict';

// Node.js built-ins

var path = require('path');

// 3rd-party modules

var async = require('async');
var uniq = require('lodash.uniq');

// our modules

var hitsFromLog = require(path.join(__dirname, 'hits-from-log'));

// this module

module.exports = function (files) {
  return new Promise(function (resolve, reject) {
    async.concat(files, function (file, done) {
      // iterator
      hitsFromLog(file).then(function (hits) {
        done(null, hits);
      }, done);
    }, function (err, results) {
      // all done, or error
      if (err) {
        reject(err);
        return;
      }
      resolve(uniq(results));
    });
  });
};
