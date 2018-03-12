/*eslint strict: ["error", "function"]*/
(() => {
  'use strict';

  const electron = require('electron');
  
  // from https://github.com/meetfranz/recipe-whatsapp/blob/master/webview.js
  setInterval(() => {
    const count = document.querySelectorAll('.counter').length;

    electron.ipcRenderer.sendToHost('hansen_got_notification', count);
  }, 1000);
  
  electron.webFrame.registerURLSchemeAsPrivileged('hansen');
  
  document.addEventListener('click', (e) => {
    const elem = e.target.closest('a[rel*="noopener"], a.thumbnailHolder');
    if (elem) {
      e.stopImmediatePropagation();
      e.preventDefault();

      window.open(elem.getAttribute('href'));
    }
}, true);
})();