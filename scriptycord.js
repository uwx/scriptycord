'use strict';

const path = require('path');
const fs = require('fs-extra');
const asar = require('asar');
const inquirer = require('inquirer');
const clog = require('clog');

function canRW(targetPath) {
  return new Promise((resolve) => {
    fs.stat(targetPath, err => {
      if (err) {
        resolve(false);
        return;
      }
      fs.access(targetPath, fs.W_OK | fs.R_OK, err => {
        resolve(!!err);
      });
    });
  });
}

(async () => {
  async function input(question) {
    const answers = await inquirer.prompt([{name: 'zero', message: question}]);
    return answers.zero;
  }
  
  async function prompt(inquiry) {
    const answers = await inquirer.prompt([Object.assign({name: 'zero'}, inquiry)]);
    return answers.zero;
  }

  const discordLocation = process.env.LOCALAPPDATA;

  const baseDir = {
    'Discord': discordLocation + '/Discord',
    'Discord PTB': discordLocation + '/DiscordPTB',
    'Canary': discordLocation + '/DiscordCanary',
  }[await prompt({
    type: 'list',
    message: 'Install on which Discord version?',
    choices: ['Discord', 'Discord PTB', 'Canary'],
  })];
  
  const appDirs = (await fs.readdir(baseDir)).filter(e => e.includes('app-'));
  
  const discordHome = baseDir + '/' + await prompt({
    type: 'list',
    message: 'Install on which app version?',
    choices: appDirs,
  }) + '/resources';
  
  // cd into the app folder
  process.chdir(discordHome);

  // extract app.asar to app folder and rename it aside

  //console.log(proc.execSync('asar e app.asar app').toString());

  if (!fs.existsSync('app.asar')) {
    clog.red('im not a wizard dude. put the asar in the right place if you wanna patch');
    process.exit(1);
  }

  if (!canRW('app.asar')) {
    clog.red('file in use! close Discord.');
    process.exit(2);
  }

  asar.extractAll('app.asar', './app');

  await fs.rename('app.asar', 'bak_app.asar');

  const cssPath = path.resolve(baseDir + '/css/css.css').replace(/\\/g, '\\\\');

  const cssParent = path.resolve(baseDir + '/css/');
  // create parent folder and css file
  fs.mkdirsSync(cssParent);

  if (await fs.exists(cssParent + '/css.css')) {
    clog.blue('css file found. welcome back, captain.');
  } else {
    fs.ensureFileSync(cssParent + '/css.css');
    clog.yellow('css file not found. please make one!');
  }
  
  const cssInjectionScript = `
  window._fs = require("fs");
  window._fileWatcher = null;
  window._styleTag = null;
  window.setupCSS = function(path) {
    var customCSS = window._fs.readFileSync(path, "utf-8");
    if(window._styleTag === null) {
      window._styleTag = document.createElement("style");
      document.head.appendChild(window._styleTag);
    }
    window._styleTag.innerHTML = customCSS;
    if(window._fileWatcher === null) {
      window._fileWatcher = window._fs.watch(path, { encoding: "utf-8" },
        function(eventType, filename) {
          if(eventType === "change") {
            var changed = window._fs.readFileSync(path, "utf-8");
            window._styleTag.innerHTML = changed;
          }
        }
      );
    }
  };
  window.tearDownCSS = function() {
    if(window._styleTag !== null) { window._styleTag.innerHTML = ""; }
    if(window._fileWatcher !== null) { window._fileWatcher.close(); window._fileWatcher = null; }
  };
  window.applyAndWatchCSS = function(path) {
    window.tearDownCSS();
    window.setupCSS(path);
  };
  window.applyAndWatchCSS('${cssPath}');`;

  fs.writeFileSync('./app/cssInjection.js', cssInjectionScript);

  const cssInjectionScriptPath = path.resolve('./app/cssInjection.js').replace(/\\/g, '\\\\');

  const cssReloadScript = `

  mainWindow.webContents.on('dom-ready', function () {
    mainWindow.webContents.executeJavaScript(
      _fs2.default.readFileSync('${cssInjectionScriptPath}', 'utf-8'));
      
    mainWindow.webContents.executeJavaScript(
      _fs2.default.readFileSync('TODO\\DiscordCanary\\injected\\zeroth.js', 'utf-8'));
      
    mainWindow.webContents.executeJavaScript(
      _fs2.default.readFileSync('TODO\\DiscordCanary\\injected\\first.js', 'utf-8'));
      
    mainWindow.webContents.executeJavaScript(
      _fs2.default.readFileSync('TODO\\DiscordCanary\\injected\\second.js', 'utf-8'));
  });`;

  const f = './app/index.js';
  const entireThing = fs.readFileSync(f, 'utf8');

  fs.writeFileSync(f, entireThing.replace("mainWindow.webContents.on('dom-ready', function () {});", cssReloadScript));

  console.log('discord patched! RESTART YOUR DISCORD CLIENT\nmess with your css at ' + cssPath.replace(/\\\\/g, '/'));

})().catch(e => {
  console.error(e);
});
