const electron = require('electron');
const fs = require('fs');
const path = require('path');
const Module = require('module');

global.hansenRoot = path.resolve(__dirname, '..');

// get highest version path
const appTitle = fs.readdirSync(global.hansenRoot).filter(e => e.includes('app-')).sort((a, b) => {
  return parseInt(b.substring(b.lastIndexOf('.')+1)) - parseInt(a.substring(a.lastIndexOf('.')+1));
})[0];
global.hansenAppRoot = path.resolve(__dirname, '..', appTitle);

const mainScreenInjections = parseInjections(fs.readFileSync('./injectionPoints - mainScreen.txt', 'utf8'));
const systemTrayInjections = parseInjections(fs.readFileSync('./injectionPoints - systemTray.txt', 'utf8'));
//const indexInjections = parseInjections(fs.readFileSync('./injectionPoints - index.txt', 'utf8'));

function parseInjections(file) {
  const actions = [];
  file = file.split('\r\n');
  for (let i = 0; i < file.length; i += 3) {
    const find = file[i];
    const replace = file[i+1];
    
    const action = {
      find
    };
    
    if (replace.startsWith('!after:')) {
      action.replace = find + replace.substr('!after:'.length);
    } else if (replace.startsWith('!before:')) {
      action.replace = replace.substr('!before:'.length) + find;
    } else {
      action.replace = replace;
    }
    action.replace = action.replace.replace(/\%\%\%/g, global.hansenRoot.replace(/\\/g, '\\\\'));
    
    actions.push(action);
  }
  return actions;
}
console.log('[Injector] injection points in mainScreen', mainScreenInjections);
console.log('[Injector] injection points in systemTray', systemTrayInjections);
//console.log('[Injector] injection points in index', indexInjections);

process.chdir(path.join(__dirname, '..', appTitle))

const root = path.join(__dirname, '..', appTitle, 'resources', 'app.asar');

electron.app.getAppPath = () => root;

// register hansen protocol
require('../injected/electronScopePremain').onEventRegister(electron, electron.app);

// fetch package.json inside app asar
const pkg = require(path.join(root, 'package.json'));

  // patch module
  Module._extensions['.js'] = (module, filename) => {
  let content = fs.readFileSync(filename, 'utf8');
  const shortname = filename.replace(root, '');
  let totalInjections = 0;

  if (filename.endsWith(`app${path.sep}mainScreen.js`)) {
    console.log('[Injector] patching main window...')
    
    for (let action of mainScreenInjections) {
      content = content.replace(action.find, action.replace);
      totalInjections++;
    }

  } else if (filename.endsWith(`app${path.sep}systemTray.js`)) {
    console.log('[Injector] patching system tray...')
    
    for (let action of systemTrayInjections) {
      content = content.replace(action.find, action.replace);
      totalInjections++;
    }
  }/* else if (filename.endsWith(`app_bootstrap${path.sep}index.js`)) {
    console.log('[Injector] patching indexjs...')
    
    for (let action of indexInjections) {
      content = content.replace(action.find, action.replace);
      totalInjections++;
    }
  }*/

  if (totalInjections >= mainScreenInjections.length + systemTrayInjections.length /*+ indexInjections.length*/) {
    console.log('[Injector] all files patched, reverting to original loader');
    Module._extensions['.js'] = oldLoader;
  }

  return module._compile(content, filename);
};

Module._load(path.join(root, pkg.main), null, true);