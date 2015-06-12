'use strict';

// Node.js built-ins

var fs = require('graceful-fs');
var zlib = require('zlib');

// this module

function readfile (filePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, function (err, buf) {
      if (err) {
        reject(err);
        return;
      }
      resolve(buf);
    });
  });
}

function gunzip (input) {
  return new Promise(function (resolve, reject) {
    zlib.gunzip(input, function (err, buf) {
      if (err) {
        reject(err);
        return;
      }
      resolve(buf);
    });
  });
}

function makeObject (props, values) {
  var obj = {};
  var v, vLength = values.length;
  if (props.length !== vLength) {
    console.error(new Error('makeObject props/values mismatch'));
    console.log(props, values);
  }
  for (v = 0; v < vLength; v += 1) {
    obj[props[v]] = values[v];
  }
  return obj;
}

function readLogEntries (filePath) {
  return readfile(filePath).then(function (buf) {
    return gunzip(buf);
  }).then(function (buf) {
    return new Promise(function (resolve) {
      var lines = buf.toString().split('\n');
      var props;
      if (!lines.length) {
        resolve([]);
        return;
      }
      if (lines.shift().trim() !== '#Version: 1.0') {
        console.log('encountered unknown log schema', lines[0]);
        resolve([]);
        return;
      }
      props = lines.shift().trim().split(' ').slice(1);
      resolve(
        lines.map(function (line) {
          var attrs = line.trim().split('\t');
          var urlPath, obj;
          if (!attrs.length || !attrs[0]) {
            // weird line
            return '';
          }
          obj = makeObject(props, attrs);
          if (obj['x-edge-result-type'] === 'Error') {
            // probably a path we never offered
            return '';
          }
          urlPath = (obj['cs-uri-stem'] || '').replace(/^\//, '');
          return urlPath;
        }).filter(function (line) {
          return !!line;
        })
      );
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
