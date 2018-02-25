'use strict';

const { require: rremote, rlocal } = Hansen;

const fs = rremote('fsxt');

const { rootPath } = rlocal('./utils/const.js');
const { firstLine } = rlocal('./utils/string.js');
const { addHook, addStyle, addScript, isLightTheme } = rlocal('./utils/domutils.js');
const { getFile } = rlocal('./utils/helpers.js');

// on page load (#friends visible)
const loadedHooks = [];
// on any message element added (arg1 is element: .message-text)
const onMessageTextLoadedHandlers = [];
// on any message group added (arg1 is element: .message-group)
const onMessageGroupLoadedHandlers = [];
// last added CSS hook num
let lastHookId = 0;

module.exports = { onMessageTextLoadedHandlers, onMessageGroupLoadedHandlers, loadedHooks, loadFile };

function injectPlugin(scriptText, error, /**/ scope, fs, require, rootPath, pluginLog, pluginError, pluginName, pluginFilename) {
  const pureName = 'scriptycord plugin: ' + pluginName + ' (' + pluginFilename + ')';
  const stringifiedName = JSON.stringify(pureName);
  const failed = 
  addScript(
    'window[' + stringifiedName + '] = function(scope, fs, require, rootPath, log, error) {'
  +    scriptText
  + '}');
  
  if (failed) {
    error('eval failed', failed);
    delete window[pureName];
    return false;
  }
  
  try {
    window[pureName](scope, fs, require, rootPath, pluginLog, pluginError);
  } catch (ex) {
    error('ainit failed', ex);
    delete window[pureName];
    return false;
  }

  delete window[pureName];
  return true;
}


async function loadFile(e, scriptPath) {
  const logfn = e.slice(0, -3); // filename without .js cache for logger
  const log = (...args) => {
    console.log('[loadPlugin:' + logfn + ']', ...args);
  };
  const error = (...args) => {
    console.error('[loadPlugin:' + logfn + ']', ...args);
  };
  
  if (!e.endsWith('.js')) {
    console.warn('[loadPlugin] non-js file', e, 'found, ignoring');
    return;
  }
  
  const plugin = e.slice(0, e.indexOf('.js'));
  
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
      if (evalBdPlugin(scope, scriptText, log, error, pluginLog, pluginError, e, f)) {
        return; // failed, continue;
      }
    } else {
      if (evalRegularPlugin(scope, scriptText, log, error, pluginLog, pluginError, e, plugin)) {
        return; // failed, continue;
      }
    }
  } catch(ex) {
    error('eval uncaught', ex);
  }
}

function evalBdPlugin(scope, scriptText, log, error, pluginLog, pluginError, e, f) {
  log('loading BD plugin [metadata: ' + f + ']');
  const pluginData = JSON.parse(f.slice('//META'.length, -'*//'.length));
  window.BdApi._entries.push(pluginData);
  window.bdplugins[pluginData.name] = pluginData;
  window.pluginCookie[pluginData.name] = true;

  // injection: semicolon to end statement, empty comment to stop broken comment.
  const pluginInjected = scriptText + ';/**/\n\nscope._bdApiInjected = ' + pluginData.name + ';';
  log('plugin metadata', pluginData);
  
  log('evaling BD plugin');
  
  if (!injectPlugin(pluginInjected, error, scope, fs, require, rootPath, pluginLog, pluginError, pluginData.name, e)) {
    return true;
  }
  
  pluginData._pluginHolder_constructor = scope._bdApiInjected;
  log('eval succeeded, building');
  const pl = pluginData._pluginHolder = new scope._bdApiInjected();
  if (pl.load) {
    log('built, loading');
    pl.load();
  }
  if (pl.start) {
    loadedHooks.push(() => {
      log('starting');
      pl.start();
    });
  }
  
  log('[' + pl.getVersion() + '] ' + pl.getName() + ' by ' + pl.getAuthor() + '\n"' + pl.getDescription() + '"');
}

function evalRegularPlugin(scope, scriptText, log, error, pluginLog, pluginError, e, plugin) {
  log('evaling non-BD plugin');
  if (!injectPlugin(scriptText, error, scope, fs, require, rootPath,  pluginLog, pluginError, plugin, e)) {
    return true;
  }
  log('eval succeeded!');

  if (scope.exports.init) {
    log('init');
    scope.exports.init();
  }
  if (scope.exports.start) {
    loadedHooks.push(() => {
      log('start');
      scope.exports.start();
    });
  }
  // add hooks
  if (scope.exports.hooks) {
    scope.exports.hooks.forEach(hook => {
      var id = 'in-' + plugin + '-hook-' + (++lastHookId);
      addHook(hook[0], id, hook[1]);
      log('hooked element listener:', hook[0], id, hook[1]);
    });
  }
  // add handlers
  if (scope.exports.onMessageTextLoaded) {
    log('adding onMessageTextLoaded handler', scope.exports.onMessageTextLoaded);
    onMessageTextLoadedHandlers.push(scope.exports.onMessageTextLoaded);
  }
  if (scope.exports.onMessageGroupLoaded) {
    log('adding onMessageGroupLoaded handler', scope.exports.onMessageGroupLoaded);
    onMessageGroupLoadedHandlers.push(scope.exports.onMessageGroupLoaded);
  }
  // inject css
  if (scope.exports.css) {
    log('injecting stylesheet');
    addStyle(scope.exports.css);
  }
  // display info
  if (scope.exports.author && scope.exports.name && scope.exports.description && scope.exports.version) {
    log('[' + scope.exports.version + '] ' + scope.exports.name + ' by ' + scope.exports.author + '\n"' + scope.exports.description + '"');
  } else {
    log('finished with success');
  }
}