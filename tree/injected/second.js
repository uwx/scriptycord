/*
I was initially worried about this runnign async not registering window elements fast enough.

so i did this little test:
(async () => {global.boop = 'beep'})(); global.boop

global.boop is sync so it's available as soon as the function is called - there is no need to wait for the event loop.
*/
window.hansenExecute(async function secondJS(rremote) {
  const path = require('path');
  const electron = require('electron');
  const proc = rremote('mz/child_process');
  const fs = rremote('mz/fs');
  
  electron.webFrame.registerURLSchemeAsPrivileged('hansen');
  electron.webFrame.registerURLSchemeAsPrivileged('extension');
  electron.webFrame.registerURLSchemeAsPrivileged('chrome-extension');
  /*
  webFrame.registerURLSchemeAsPrivileged(scheme[, options])

      scheme String
      options Object (optional)
          secure Boolean - (optional) Default true.
          bypassCSP Boolean - (optional) Default true.
          allowServiceWorkers Boolean - (optional) Default true.
          supportFetchAPI Boolean - (optional) Default true.
          corsEnabled Boolean - (optional) Default true.

  */

  // add your callback to here, will be called with token when it's available
  var _hansenTokenReadyCallbacks = [];
  var _hansenTokenIsDone = false;
  window.addTokenReadyCallback = func => {
    if (_hansenTokenIsDone) {
      func(window.hansenToken);
    } else {
      _hansenTokenReadyCallbacks.push(func);
    }
  };
  
  if (await fs.exists(userDataRoot + '/token.txt')) {
    window.hansenToken = await fs.readFile(userDataRoot + '/token.txt', 'utf8');
    _hansenTokenIsDone = true;
    _hansenTokenReadyCallbacks.forEach(e => e(window.hansenToken));
    _hansenTokenReadyCallbacks = [];
    
    return;
  }

  // read token from sqlite and make it available, call callbacks
  let e = await proc.execFile(protocolRoot + '/sqlite3.exe', [window.hansenLocalStorageRoot + '/https_canary.discordapp.com_0.localstorage', 'select hex(value) from ItemTable where key = "token";']);
  if (e[0]) e = e[0];

  const out = [];
  for (var i = 0; i < e.length; i += 4) {
    out.push(String.fromCharCode(parseInt(e.substr(i, 2), 16)));
  }
  window.hansenToken = out.join('').slice(1, -2)
  console.log('[second][TokenFetcher] got it!', window.hansenToken);
  _hansenTokenIsDone = true;
  _hansenTokenReadyCallbacks.forEach(e => e(window.hansenToken));
  _hansenTokenReadyCallbacks = [];
  
  await fs.writeFile(userDataRoot + '/token.txt', window.hansenToken).catch(e => console.error('[second.js] failed to write token ' + e));
});