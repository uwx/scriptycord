var path = require('path');

module.exports = {
  // require(require('path').relative(__dirname, 'C:/Users/XXX/AppData/Local/DiscordCanary/injected/electronScopePremain')).onEventRegister(_require, app, _require.BrowserWindow, null, _require.ipcMain, null, _require.shell);
  onEventRegister(_electron, app) {
    app.commandLine.appendSwitch('enable-experimental-web-platform-features');
    
    var protocol = _electron.protocol || _electron.default.protocol;
    // see second.js
    protocol.registerStandardSchemes(['hansen'], {secure: true});
    app.on('ready', () => {
      protocol.registerFileProtocol('hansen', function(req, callback) {
        var url = req.url.substr(9);
        if (url.endsWith('/')) {
          url = url.slice(0, -1);
        }
        
        console.log('[HANSEN] url', url);
        callback({path: path.normalize(__dirname + '/../injectedProtocol/' + url)})
      }, function (error) {
        if (error) {
          console.error('[HANSEN] Failed to register protocol', error);
        }
      });
    });
  },
  
  // require(_path.relative(__dirname, 'C:/Users/XXX/AppData/Local/DiscordCanary/injected/electronScopePremain')).onWindowCreate(mainWindowOptions, _electron, _electron.app, _electron.BrowserWindow, null, _electron.ipcMain, null, _electron.shell);
  onWindowCreate(mainWindowOptions, _electron, app, BrowserWindow, crashReporter, ipcMain, Menu, shell) {
    
  },
};