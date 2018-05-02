/*eslint strict: ["error", "function"]*/
(() => {
  'use strict';

  const electron = require('electron');
  
  // from https://github.com/kevinoes/franz-plugin-steam-chat/blob/master/webview.js
  setInterval(() => {    
    //// get new msg count
    let count = 0;
    let counters = document.querySelectorAll('.unread_message_count:not([style="display: none;"])');
    counters = Array.prototype.slice.call(counters, Math.floor(counters.length / 2));
    [].filter.call(counters, countValues => {
      const countValue = countValues.getElementsByClassName('unread_message_count_value')[0];
      if (countValue && countValue.firstChild && countValue.firstChild.nodeValue) {
        count += parseInt(countValue.firstChild.nodeValue);
      }
    });
    electron.ipcRenderer.sendToHost('hansen_got_notification', count);

    // force scroll to bottom of chat window
    const chatBoxes = document.getElementsByClassName('chat_dialog');
    const chatBox = Array.prototype.filter.call(chatBoxes, chat => chat.style.display !== 'none');
    if (chatBox[0]) {
      const chatWindow = chatBox[0].querySelector('chat_dialog_scroll');
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, 1000);
  
  electron.webFrame.registerURLSchemeAsPrivileged('hansen');
})();