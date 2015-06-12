'use strict';

// Node.js built-ins

// var fs = require('graceful-fs');
// var path = require('path');

// 3rd-party modules

var glob = require('glob');

// this module

// function getGitIgnores () {
//   var gitIgnorePath = path.join(process.cwd(), '.gitignore');
//   return new Promise(function (resolve, reject) {
//     fs.exists(gitIgnorePath, function (exists) {
//       if (!exists) {
//         resolve([]);
//         return;
//       }
//       fs.readFile(gitIgnorePath, { encoding: 'utf8' }, function (err, data) {
//         if (err) {
//           reject(err);
//           return;
//         }
//         resolve(
//           data.split('\n').map(function (line) {
//             return line.trim();
//           }).filter(function (line) {
//             return !!(line && line[0] !== '#');
//           }).map(function (line) {
//             return line + '**/*';
//           })
//         );
//       });
//     });
//   });
// }

module.exports = function () {
  return new Promise(function (resolve, reject) {
    glob('**/*', {
      ignore: ['node_modules/**/*'],
      nomount: true
    }, function (err, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
};
