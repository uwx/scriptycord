/*eslint strict:off*/
try{
  const electron = require('electron');
  const path = require('path');
  
  //"C:\Users\XXXX\AppData\Local\DiscordCanary"
  window.hansenRoot = electron.remote.getGlobal('hansenRoot');
  
  //"C:\Users\XXXX\AppData\Local\DiscordCanary\app-0.0.176"
  window.hansenAppRoot = electron.remote.getGlobal('hansenAppRoot');
  
  // localstorage files
  window.hansenLocalStorageRoot = path.resolve(window.hansenRoot, '../../Roaming/discordcanary/Local Storage');
  
  // hansen:// root
  window.protocolRoot = path.resolve(window.hansenRoot, './injectedProtocol');
  
  // injectedUserData (store your things in here)
  window.userDataRoot = path.resolve(window.hansenRoot, './injectedUserData');

  // like rlocal, but for node modules
  const rremote = global.__require = mod => {
    return require(path.relative(__dirname, window.hansenRoot + '\\injectedNodeModules\\node_modules\\' + mod));
  };
  function rlocal(find) {
    return require(path.join(path.relative(__dirname, window.hansenRoot + '\\injected'), find));
  }
  console.log('[zeroth]', __dirname);
  
  console.log('[zeroth] injecting helper funcs');
  window.hansenExecute = func => {
    const fn = func.name || '<unnamed function>';
    console.log('[zeroth from extern] executing', fn);
    console.log({stack:new Error()});
    
    const result = func(rremote, rlocal);
    if (result instanceof Promise) {
      result.then((...args) => {
        console.log('[zeroth from extern][' + fn + '] finished successfully;', ...args);
      }).catch((...errors) => {
        console.error('[zeroth from extern][' + fn + '] failed');
        
        console.error('[zeroth from extern][' + fn + '] error results', ...errors.filter(e => {
          if (e instanceof Error) {
            console.error(e);
            return false;
          }
          return true;
        }));
      });
    } else {
      console.log('[zeroth from extern][' + fn + '] finished', (result || '<no result>'));
    }
  };
  
  console.log('[PluginLoader] begin');
  var __dirty = false;

  var __load = async function() {
    'use strict';
    
    //console.log(__dirname);
    //__dirname="C:\Users\XXX\AppData\Roaming\npm\node_modules\electron\dist\resources\electron.asar\renderer"
    
    const fs = rremote('mz/fs');
    const { rootPath } = rlocal('./utils/const.js');
    
    // on any message element added (arg1 is element: .message-text)
    const onMessageTextLoadedHandlers = [];
    // on any message group added (arg1 is element: .message-group)
    const onMessageGroupLoadedHandlers = [];
    // on text input press enter (arg1 is text, retval mutates the input)
    //var textareaHandlers = [];
    
    console.log('[PluginLoader] loading storage');
    const storageData = JSON.parse(await fs.readFile(rootPath + 'injectedUserData\\storage.json', 'utf8'));
    window.addEventListener('unload', () => {
      fs.writeFileSync(rootPath + 'injectedUserData\\storage.json', JSON.stringify(storageData));
    });
    process.on('exit', () => {
      fs.writeFileSync(rootPath + 'injectedUserData\\storage.json', JSON.stringify(storageData));
    });
    electron.remote.app.on('before-quit', () => {
      fs.writeFileSync(rootPath + 'injectedUserData\\storage.json', JSON.stringify(storageData));
    })
    
    const { escapeHtml, firstLine } = rlocal('./utils/string.js');
    const { addHook, addStyle, addScript, isLightTheme } = rlocal('./utils/domutils.js');
    
    async function catchAsync(promise, errorMessage, def) {
      try {
        return await promise;
      } catch (e) {
        console.error('[PluginLoader][catchAsync]', errorMessage, e);
        return def;
      }
    }
    
    function loadIt(scriptText, error, /**/ scope, fs, require, rootPath, pluginLog, pluginError) {
      const failed = 
      addScript(
        'window.__plugin_inProgress = function(scope, fs, require, rootPath, log, error) {'
      +    scriptText
      + '}');
      
      if (failed) {
        error('eval failed', failed);
        delete window.__plugin_inProgress;
        return false;
      }
      
      try {
        window.__plugin_inProgress(scope, fs, require, rootPath, pluginLog, pluginError);
      } catch (ex) {
        error('ainit failed', failed);
        delete window.__plugin_inProgress;
        return false;
      }

      delete window.__plugin_inProgress;
      return true;
    }
    
    // Get a text file from the hansen protocol. Utility to avoid requiring 'fs' everywhere.
    function getFile(url) {
      return fs.readFileSync(rootPath + 'injectedProtocol\\' + url.substring('hansen://'.length), 'utf8');
    }
    
    // settings system
    console.log('[PluginLoader] prepare settings menu system');
    await rlocal('./logic/pluginSettings.js').load();
    
    //

    console.log('[PluginLoader] prepare polyfills');
    window.Hansen = {
      require: rremote,
      rlocal,
      path,
      mzfs: fs,
      rootPath
    };
    // used by bd plugin event listeners
    // https://github.com/Jiiks/BetterDiscordApp/blob/master/js/main.js#L2966-L3065
    // https://github.com/rauenzi/BetterDiscordApp/blob/28174e59c9fb4ce9d747760b5b618c52d112c897/js/main.js#L1351-L1414
    window.BdApi = {
      _entries: [],
      getPlugin(name) {
        return window.BdApi._entries.find(e => e.name == name)._pluginHolder;
      },
      injectCSS(name, text) {
        const style = document.createElement('style');

        style.id = '__pluginStyles_' + name;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(text));

        document.head.appendChild(style);
      },
      clearCSS(name) {
        const elem = document.getElementById('__pluginStyles_' + name);
        if (elem) elem.parentNode.removeChild(elem);
      },
      // Edited version of getReactInstance by noodlebox/samogot
      getReactInstance(node) {
        if (!(node instanceof jQuery) && !(node instanceof Element)) return undefined;
        var domNode = node instanceof jQuery ? node[0] : node;
        return domNode[Object.keys(domNode).find(key => key.startsWith('__reactInternalInstance'))];
      },
      getReactProperty(node, path) {
        var value = path.split(/\s?\.\s?/).reduce(function(obj, prop) {
          return obj && obj[prop];
        }, window.BdApi.getReactInstance(node));
        return value;
      }
    };
    // bd storage polyfill (this needs to be on 'window', can't be a function arg)
    window.bdPluginStorage = {
      get: function(plugin, key) {
        return (storageData.bd && storageData.bd[plugin]) ? storageData.bd[plugin][key] : null;
      },
      set: function(plugin, key, value) {
        if (!storageData.bd) {
          storageData.bd = {};
        }
        if (!storageData.bd[plugin]) {
          storageData.bd[plugin] = {};
        }
        var stored = storageData.bd[plugin][key];
        storageData.bd[plugin][key] = value;
        return stored;
      },
      delete(plugin, key) {
        if (storageData.bd && storageData.bd[plugin]) {
          delete storageData.bd[plugin][key];
        }
      },
    };
    
    console.log('[PluginLoader] begin inject plugins');
    const files = await catchAsync(fs.readdir(rootPath + 'injectedPlugins'), 'readdir failed with', []);
    const loadedHooks = [];
    
    console.log('[PluginLoader] found ' + files.length + ' plugins');
    for (let e of files) {
      const logfn = e.slice(0, -3); // filename without .js cache for logger
      const log = (...args) => {
        console.log('[PluginLoader:' + logfn + ']', ...args);
      };
      const error = (...args) => {
        console.error('[PluginLoader:' + logfn + ']', ...args);
      };
      
      if (!e.endsWith('.js')) {
        console.warn('[PluginLoader] non-js file', e, 'found, ignoring');
        return;
      }
      
      const plugin = e.slice(0, e.indexOf('.js'));
      const scriptPath = rootPath + 'injectedPlugins\\' + e;
      
      const scope = {
        exports: {},
        addHook,
        addStyle,
        addScript,
        isLightTheme,
        getFile,
      };
      const pluginLog = (...whew) => {
        console.log('[Plugin]['+e+']', ...whew);
      };
      const pluginError = (...whew) => {
        console.error('[Plugin]['+e+']', ...whew);
      };
      
      log('evaluating plugin');
      try {
        const scriptText = await fs.readFile(scriptPath, 'utf8');
        const f = firstLine(scriptText);
        // BD declaration.. seems to be the only way to get the name of the plugin class
        if (f.startsWith('//META')) {
          log('loading BD plugin [metadata: ' + f + ']');
          const pluginData = JSON.parse(f.slice('//META'.length, -'*//'.length));
          window.BdApi._entries.push(pluginData);
          // injection: semicolon to end statement, empty comment to stop broken comment.
          const pluginInjected = scriptText + ';/**/\n\nscope._bdApiInjected = ' + pluginData.name + ';';
          log('plugin metadata', pluginData);
          
          log('evaling BD plugin');
          
          if (!loadIt(pluginInjected, error, scope, fs, require, rootPath, pluginLog, pluginError)) {
            continue;
          }
          
          pluginData._pluginHolder_constructor = scope._bdApiInjected;
          log('eval succeeded, building');
          const pl = pluginData._pluginHolder = new scope._bdApiInjected();
          log('built, loading');
          if (pl.load) pl.load();
          log('loaded, starting');
          if (pl.start) loadedHooks.push(() => {
            pl.start();
          });
          
          log('[' + pl.getVersion() + '] ' + pl.getName() + ' by ' + pl.getAuthor() + '\n"' + pl.getDescription() + '"');
        } else {
          log('evaling non-BD plugin');
          if (!loadIt(scriptText, error, scope, fs, require, rootPath,  pluginLog, pluginError)) {
            continue;
          }
          log('eval succeeded!');
      
          if (scope.exports.init) {
            log('init');
            scope.exports.init();
            log('initted');
          }
          if (scope.exports.start) loadedHooks.push(() => {
            log('start');
            scope.exports.start();
            log('started');
          });
          if (scope.exports.hooks) {
            scope.exports.hooks.forEach(hook => {
              var id = 'in-' + plugin + '-hook-' + Math.random().toString().replace(/[^0-9]/g, '');
              addHook(hook[0], id, hook[1]);
              log('hooked element listener:', hook[0], id, hook[1]);
            });
          }
          if (scope.exports.onMessageTextLoaded) {
            log('adding onMessageTextLoaded handler', scope.exports.onMessageTextLoaded);
            onMessageTextLoadedHandlers.push(scope.exports.onMessageTextLoaded);
          }
          if (scope.exports.onMessageGroupLoaded) {
            log('adding onMessageGroupLoaded handler', scope.exports.onMessageGroupLoaded);
            onMessageGroupLoadedHandlers.push(scope.exports.onMessageGroupLoaded);
          }
          if (scope.exports.css) {
            log('injecting stylesheet');
            addStyle(scope.exports.css);
          }
          if (scope.exports.author && scope.exports.name && scope.exports.description && scope.exports.version) {
            log('[' + scope.exports.version + '] ' + scope.exports.name + ' by ' + scope.exports.author + '\n"' + scope.exports.description + '"');
          } else {
            log('finished with success');
          }
        }
      } catch(ex) {
        error('eval uncaught', ex);
      }
    }
    
    let loadedDone = false;
    addHook('#friends, .chat', '__allLoaded', el => {
      if (loadedDone) return;
      loadedDone = true;
      for (let hook of loadedHooks) {
        try {
          hook(el);
        } catch(ex) {
          console.error('[PluginLoader][LoadHooks] failed with', ex);
        }
      }
    });
    
    addHook('.message-text', 'hansen-message-text-handler', e => onMessageTextLoadedHandlers.forEach(f => f(e)));
    addHook('.message-group', 'hansen-message-group-handler', e => onMessageGroupLoadedHandlers.forEach(f => f(e)));
  };  
  
  __load();
  
  console.log('[PluginLoader] end');
}catch(e){
  console.error(e); alert(e);
}