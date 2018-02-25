'use strict';

const electron = require('electron');
const path = require('path');

const fs = Hansen.require('fsxt');
const { rootPath } = Hansen.rlocal('./utils/const.js');

//"C:\Users\XXXX\AppData\Local\DiscordCanary\app-0.0.176"
window.hansenAppRoot = electron.remote.getGlobal('hansenAppRoot');

// localstorage files
window.hansenLocalStorageRoot = path.resolve(window.hansenRoot, '../../Roaming/discordcanary/Local Storage');

// hansen:// root
window.protocolRoot = path.resolve(window.hansenRoot, './injectedProtocol');

// injectedUserData (store your things in here)
window.userDataRoot = path.resolve(window.hansenRoot, './injectedUserData');

// BD data root
window.betterDiscordRoot = path.resolve(process.env.appdata, 'BetterDiscord/');

// BD plugins folder
window.betterDiscordPluginsRoot = path.resolve(process.env.appdata, 'BetterDiscord/plugins/');

//__dirname="C:\Users\XXX\AppData\Roaming\npm\node_modules\electron\dist\resources\electron.asar\renderer"
console.log('[registerGlobals] dirname: ', __dirname);
  
window.Hansen.path = path;
window.Hansen.mzfs = fs;
window.Hansen.rootPath = rootPath;

window.hansenExecute = func => {
  const fn = func.name || '<unnamed function>';
  console.log('[registerGlobals extern] executing', fn);
  console.log({stack:new Error()});
  
  const result = func(Hansen.require, Hansen.rlocal);
  if (result instanceof Promise) {
    result.then((...args) => {
      console.log('[registerGlobals extern][' + fn + '] finished successfully;', ...args);
    }).catch((...errors) => {
      console.error('[registerGlobals extern][' + fn + '] failed');
      
      console.error('[registerGlobals extern][' + fn + '] error results', ...errors.filter(e => {
        if (e instanceof Error) {
          console.error(e);
          return false;
        }
        return true;
      }));
    });
  } else {
    console.log('[registerGlobals extern][' + fn + '] finished', (result || '<no result>'));
  }
};
