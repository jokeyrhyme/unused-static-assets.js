'use strict';

// this module

/**
 * @constructor
 * @param {String} path absolute
 */
function Asset (path) {
  this.parent = null;
  this.path = path;
  this.isHit = false;
}

Asset.prototype.toString = function () {
  return this.path;
};

Asset.prototype.hit = function () {
  this.isHit = true;
  if (this.parent) {
    this.parent.hit();
  }
};

module.exports = Asset;
