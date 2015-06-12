'use strict';

// Node.js built-ins

var fs = require('graceful-fs');
var zlib = require('zlib');

// this module

function readLogEntries (filePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, function (err, gzBuf) {
      if (err) {
        reject(err);
        return;
      }
      zlib.gunzip(gzBuf, function (err, buf) {
        if (err) {
          reject(err);
          return;
        }
        resolve(
          buf.toString().split('\n').map(function (line) {
            return line.trim();
          }).filter(function (line) {
            return !!line;
          }).map(function (line) {
            var attrs = line.split('\t');
            var urlPath;
            // if (!attrs[9] || attrs[9] === '-') {
            //   // no referrer
            //   return '';
            // }
            // if (!attrs[10] || attrs[10] === '-') {
            //   // no user agent
            //   return '';
            // }
            urlPath = (attrs[7] || '').replace(/^\//, '');
            return urlPath;
          }).filter(function (line) {
            return !!line;
          })
        );
      });
    });
  });
}

module.exports = function (logPath) {
  var extraHits = [];
  return readLogEntries(logPath).then(function (hits) {
    hits.forEach(function (hit) {
      var rawHit;
      if (/\.gz$/.test(hit)) {
        rawHit = hit.replace(/\.gz$/, '');
        if (hits.indexOf(rawHit) === -1) {
          extraHits.push(rawHit);
        }
      }
    });
    hits.push.apply(hits, extraHits);
    return Promise.resolve(hits);
  });
};
