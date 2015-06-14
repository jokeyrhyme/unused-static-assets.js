'use strict';

// Node.js built-ins

var path = require('path');

// our modules

var makeTree = require(path.join(__dirname, 'asset-tree'));

// this function

/**
 * @param {String[]} hits array of assets that were hit
 * @returns {Promise} resolves once unused assets have been identified
 */
module.exports = function (hits) {
  var cwd = process.cwd();
  return makeTree().then(function (tree) {
    var results = {};
    hits.forEach(function (hit) {
      var asset = tree.find(path.join(cwd, hit));
      if (asset) {
        asset.hit();
      }
    });
    tree.unused().forEach(function (asset) {
      var name = asset.path.replace(cwd + '/', '');
      results[name] = asset.size();
    });
    console.log(results);
  });
};
