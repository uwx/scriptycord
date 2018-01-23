const { rootPath } = require('./const.js');
const electron = require('electron');
const path = require('path');

module.exports = find => {
  console.warn('rlib is deprecated, use __require (rlocal)');
  return global.__require(find);
}