'use strict';

// TODO check for existance of app.asar... and if not then try applying to existing modified indexjs
const path = require('path');
const fs = require('fs');

const discordHome = String.raw`C:\Users\Rafael\AppData\Local\Discord\app-0.0.295\resources`;

/*extract app.asar to app folder and rename it aside*/

process.chdir(discordHome);

const cssPath = path.resolve('./css/css.css').replace(/\\/g, '\\\\');

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

fs.writeFileSync('./app/app/cssInjection.js', cssInjectionScript);

const cssInjectionScriptPath = path.resolve('./app/app/cssInjection.js').replace(/\\/g, '\\\\');

const cssReloadScript = `
mainWindow.webContents.on('dom-ready', function () {
  mainWindow.webContents.executeJavaScript(
    _fs2.default.readFileSync('${cssInjectionScriptPath}', 'utf-8')
  );
});`;

const f = './app/app/index.js';
const entireThing = fs.readFileSync(f, 'utf8');

fs.writeFileSync(f, entireThing.replace("mainWindow.webContents.on('dom-ready', function () {});", cssReloadScript));
