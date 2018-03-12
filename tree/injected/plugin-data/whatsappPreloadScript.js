/*eslint strict: ["error", "function"]*/
(() => {
  'use strict';

  const electron = require('electron');
  
  // from https://github.com/meetfranz/recipe-whatsapp/blob/master/webview.js
  setInterval(() => {
    const elements = document.querySelectorAll('.CxUIE, .unread');
    let count = 0;

    for (let i = 0; i < elements.length; i += 1) {
      if (elements[i].querySelectorAll('*[data-icon="muted"]').length === 0) {
        count += 1;
      }
    }

    electron.ipcRenderer.sendToHost('hansen_got_notification', count);
  }, 1000);
  
  electron.webFrame.registerURLSchemeAsPrivileged('hansen');
})();