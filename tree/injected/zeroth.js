/*eslint strict:off*/
try {
  syncLoad();
  zerothLoad().catch(err => {
    console.error('[zrothLoad]',err);
  });
} catch(e) {
  console.error(e);
  alert(e);
}

function syncLoad() {
  const electron = require('electron');
  const path = require('path');

  console.log('[zeroth] injecting globals');
  
  // need to declare this early
  //"C:\Users\XXXX\AppData\Local\DiscordCanary"
  window.hansenRoot = electron.remote.getGlobal('hansenRoot');

  window.Hansen = {
    // require a file relative to DiscordCanary\injectedNodeModules\node_modules
    require(mod) {
      return require(path.relative(__dirname, window.hansenRoot + '\\injectedNodeModules\\node_modules\\' + mod));
    },
    // require a file relative to DiscordCanary\injected
    rlocal(find) {
      return require(path.join(path.relative(__dirname, window.hansenRoot + '\\injected'), find));
    },
  };

  // register rest of the globals
  Hansen.rlocal('./logic/registerGlobals.js');

  global.__require = Hansen.require;
}

async function zerothLoad() {
  'use strict';
  
  const { require: rremote, rlocal } = Hansen;
  
  const { rootPath } = Hansen.rlocal('./utils/const.js');

  const fs = rremote('fsxt');

  console.log('[PluginLoader] begin');
    
  console.log('[PluginLoader] loading storage');
  const storageData = await rlocal('./logic/storage.js').load();
  
  const { catchAsync } = rlocal('./utils/helpers.js');

  const { addHook } = rlocal('./utils/domutils.js');

  // settings system
  console.log('[PluginLoader] prepare settings menu system');
  await rlocal('./logic/pluginSettings.js').load();
  
  //
  console.log('[PluginLoader] prepare polyfills');
  rlocal('./logic/polyfills.js').load(storageData);

  console.log('[PluginLoader] begin inject plugins');
  const files = await catchAsync(fs.readdir(rootPath + 'injectedPlugins'), 'readdir failed with', []);
  
  console.log('[PluginLoader] found ' + files.length + ' plugins');
  const pluginLoader = rlocal('./logic/loadPlugin.js');
  for (let e of files) {
    await pluginLoader.loadFile(e, rootPath + 'injectedPlugins\\' + e);
  }

  if (await bdFirstTimeWarning(fs)) {
    console.log('[PluginLoader] begin inject bd plugins folder');
    const afiles = await catchAsync(fs.readdir(window.betterDiscordPluginsRoot), 'readdir-bd failed with', []);
    console.log('[PluginLoader] found ' + afiles.length + ' bd plugins');
    for (let e of afiles) {
      await pluginLoader.loadFile(e, window.betterDiscordPluginsRoot + '\\' + e);
    }
  }

  // on completion, add load event hook
  let loadedDone = false;
  addHook('#friends, .chat', '__allLoaded', el => {
    if (loadedDone) return;
    loadedDone = true;
    for (let hook of pluginLoader.loadedHooks) {
      try {
        hook(el);
      } catch(ex) {
        console.error('[PluginLoader][LoadHooks] failed with', ex);
      }
    }
  });
  
  addHook('.message-text', 'hansen-message-text-handler', e => pluginLoader.onMessageTextLoadedHandlers.forEach(f => f(e)));
  addHook('.message-group', 'hansen-message-group-handler', e => pluginLoader.onMessageGroupLoadedHandlers.forEach(f => f(e)));

  console.log('[PluginLoader] end');
}

async function bdFirstTimeWarning(fs) {
  if (await fs.exists(window.betterDiscordPluginsRoot)) {
    if (!(await fs.exists(window.betterDiscordRoot + '/seen.me'))) {
      alert('a BetterDiscord plugins folder was found. plugins can now be laoded from there, so you might have conflicts or incompatibilities.');
      await fs.writeFile(window.betterDiscordRoot + '/seen.me', 'check');
    }
    return true;
  }
  return false;
}