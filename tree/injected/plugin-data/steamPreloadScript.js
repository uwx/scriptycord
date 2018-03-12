/*eslint strict: ["error", "function"]*/
(() => {
  'use strict';

  const electron = require('electron');
  
  // from https://github.com/meetfranz/recipe-whatsapp/blob/master/webview.js
  setInterval(() => {
    
    // get new msg count
    let count = 0;
    let counters = document.querySelectorAll('.unread_message_count:not([style="display: none;"])');
    counters = Array.prototype.slice.call(counters, Math.floor(counters.length / 2));
    [].filter.call(counters, function(countValues) {
      const countValue = countValues.querySelector('.unread_message_count_value');
      if (countValue.innerHTML.length > 0) {
        count += parseInt(countValue.innerHTML);
      }
    });
    electron.ipcRenderer.sendToHost('hansen_got_notification', count);

    // force scroll to bottom of chat window
    const chatBoxes = document.querySelectorAll('.chat_dialog');
    const chatBox = [].filter.call(chatBoxes, function(chat) {
      return (chat.style.display !== 'none');
    });
    const chatWindow = chatBox[0].querySelector('.chat_dialog_scroll');
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 1000);
  
  electron.webFrame.registerURLSchemeAsPrivileged('hansen');
})();