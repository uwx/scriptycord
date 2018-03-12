/*eslint strict: ["error", "function"]*/
(() => {
  'use strict';

  const electron = require('electron');
  
  // from https://github.com/meetfranz/recipe-whatsapp/blob/master/webview.js
  setInterval(() => {
    let count = 0;
    const searchElement = document.querySelector('.im_dialogs_search_field');
    if (searchElement && searchElement.value === '') {
      const elements = document.querySelectorAll('.im_dialog_badge:not(.ng-hide):not(.im_dialog_badge_muted)');
      if (elements) {
        for (let i = 0; i < elements.length; i += 1) {
          if (elements[i].innerHTML !== 0) {
            count += 1;
          }
        }
      }
    }

    electron.ipcRenderer.sendToHost('hansen_got_notification', count);
  }, 1000);
  
  electron.webFrame.registerURLSchemeAsPrivileged('hansen');
})();