'use strict';

const path = require('path');
const fs = require('fs-extra');
const asar = require('asar');

const home1 = process.env.LOCALAPPDATA + String.raw`\Discord\app-0.0.295\resources`;
const home2 = process.env.LOCALAPPDATA + String.raw`\Discord\app-0.0.296\resources`;
const home3 = process.env.LOCALAPPDATA + String.raw`\Discord\app-0.0.297\resources`;
let discordHome;

if (fs.existsSync(home3)) {
  discordHome=home3;
} else if (fs.existsSync(home2)) {
  discordHome=home2;
} else if (fs.existsSync(home1)) {
  discordHome=home1;
}

process.chdir(discordHome);

// extract app.asar to app folder and rename it aside

//console.log(proc.execSync('asar e app.asar app').toString());

if (!fs.existsSync('app.asar')) {
  console.error('im not a wizard dude. put the asar in the right place if you wanna patch');
  process.exit(1);
}

asar.extractAll('app.asar', './app');

fs.renameSync('app.asar', 'bak_app.asar');

const cssPath = path.resolve(process.env.LOCALAPPDATA + '/Discord/css/css.css').replace(/\\/g, '\\\\');

const cssParent = path.resolve(process.env.LOCALAPPDATA + '/Discord/css/');
// create parent folder and css file
fs.mkdirsSync(cssParent);
fs.ensureFileSync(cssParent + 'css.css');

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
    _fs2.default.readFileSync('${cssInjectionScriptPath}', 'utf-8')
  );
});`;

const f = './app/index.js';
const entireThing = fs.readFileSync(f, 'utf8');

fs.writeFileSync(f, entireThing.replace("mainWindow.webContents.on('dom-ready', function () {});", cssReloadScript));

console.log('discord patched! RESTART YOUR DISCORD CLIENT and mess with your css at ' cssParent + 'css.css');