'use strict';

// Node.js built-ins

var path = require('path');

// 3rd-party modules

var isPathInside = require('is-path-inside');

// our modules

var Asset = require(path.join(__dirname, 'asset'));

// this module

/**
 * @constructor
 * @param {String} path absolute
 */
function AssetDir (path) {
  Asset.call(this, path);
  this.children = [];
}

AssetDir.prototype = Object.create(Asset.prototype, {
  constructor: {
    value: Asset
  }
});

AssetDir.prototype.find = function (file) {
  var match;
  var matches = this.children.filter(function (child) {
    return file === child.path || isPathInside(file, child.path);
  });
  if (!matches.length) {
    return null;
  }
  match = matches[0];
  if (file === match.path) {
    return match;
  }
  return match.find(file);
};

AssetDir.prototype.unused = function (file) {
  var matches = [];
  this.children.forEach(function (child) {
    if (child instanceof AssetDir) {
      if (!child.isHit) {
        matches.push(child);
        return;
      }
      matches.push.apply(matches, child.unused());
    }
  });
  return matches;
};

module.exports = AssetDir;
