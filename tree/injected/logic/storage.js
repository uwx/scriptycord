'use strict';

const electron = require('electron');
const fs = Hansen.require('fsxt');
const rootPath = window.hansenRoot;

exports.load = async () => {
  const storageData = JSON.parse(await fs.readFile(rootPath + '\\injectedUserData\\storage.json', 'utf8'));
  window.addEventListener('unload', () => {
    fs.writeFileSync(rootPath + '\\injectedUserData\\storage.json', JSON.stringify(storageData));
  });
  process.on('exit', () => {
    fs.writeFileSync(rootPath + '\\injectedUserData\\storage.json', JSON.stringify(storageData));
  });
  electron.remote.app.on('before-quit', () => {
    fs.writeFileSync(rootPath + '\\injectedUserData\\storage.json', JSON.stringify(storageData));
  });
  return storageData;
};