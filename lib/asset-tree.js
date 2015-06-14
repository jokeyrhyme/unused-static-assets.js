'use strict';

// Node.js built-ins

var fs = require('graceful-fs');
var path = require('path');

// our modules

var Asset = require(path.join(__dirname, 'asset'));
var AssetDir = require(path.join(__dirname, 'asset-dir'));

// this function

var IGNORES = [ 'node_modules' ];

function stat (filePath) {
  return new Promise(function (resolve, reject) {
    fs.stat(filePath, function (err, stats) {
      if (err) {
        reject(err);
        return;
      }
      resolve(stats);
    });
  });
}

function isDir (dir) {
  return stat(dir).then(function (stats) {
    return Promise.resolve(stats.isDirectory());
  });
}

function readdir (dir) {
  return new Promise(function (resolve, reject) {
    fs.readdir(dir, function (err, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
}

function walk (dir) {
  return isDir(dir).then(function (result) {
    if (!result) {
      return Promise.resolve(new Asset(dir));
    }
    return readdir(dir).then(function (files) {
      return Promise.all(
        files.filter(function (file) {
          return file[0] !== '.' && IGNORES.indexOf(file) === -1;
        }).map(function (file) {
          return walk(path.join(dir, file));
        })
      );
    }).then(function (children) {
      var assetDir = new AssetDir(dir);
      assetDir.children = children;
      children.forEach(function (child) {
        child.parent = assetDir;
      });
      return Promise.resolve(assetDir);
    });
  });
}

/**
 * based on hits, identity
 * @param {String} [cwd] root asset directory, defaults to `process.cwd()`
 * @returns {Promise} resolved with AssetDir
 */
module.exports = function (cwd) {
  var root = cwd || process.cwd();
  return walk(root);
};
