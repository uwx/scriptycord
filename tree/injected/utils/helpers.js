'use strict';

const fs = Hansen.require('fsxt');
const { rootPath } = Hansen.rlocal('./utils/const.js');

async function catchAsync(promise, errorMessage, def) {
  try {
    return await promise;
  } catch (e) {
    console.error('[PluginLoader][catchAsync]', errorMessage, e);
    return def;
  }
}

// Get a text file from the hansen protocol. Utility to avoid requiring 'fs' everywhere.
function getFile(url) {
  return fs.readFileSync(rootPath + 'injectedProtocol\\' + url.substring('hansen://'.length), 'utf8');
}

module.exports = { catchAsync, getFile };