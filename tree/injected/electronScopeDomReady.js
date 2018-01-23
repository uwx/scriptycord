module.exports = function(_electron2, app, BrowserWindow, crashReporter, ipcMain, Menu, shell, mainWindow, fs = require('fs')) {
  return function() {
    mainWindow.webContents.executeJavaScript(
      (fs.readFileSync || fs.default.readFileSync)(global.hansenRoot + '\\injected\\zeroth.js', 'utf-8'));
      
    mainWindow.webContents.executeJavaScript(
      (fs.readFileSync || fs.default.readFileSync)(global.hansenRoot + '\\injected\\first.js', 'utf-8'));
      
    mainWindow.webContents.executeJavaScript(
      (fs.readFileSync || fs.default.readFileSync)(global.hansenRoot + '\\injected\\second.js', 'utf-8'));
      
    mainWindow.webContents.executeJavaScript(
      (fs.readFileSync || fs.default.readFileSync)(global.hansenRoot + '\\injected\\cssInjection.js', 'utf-8'));
      
  };
};