console.log('[FIRST LOADER] ' + window.localStorage);

window.addEventListener('storage', function(e) {
  console.log(storageArea);
  console.log(storageArea.token);
  console.log('The ' + e.key + ' key has been changed from ' + e.oldValue + ' to ' + e.newValue + '.');
});

(() => {
  const {ipcRenderer, ipcMain} = require('electron');
  ipcRenderer.on('HANSEN_NOTIFICATION_POPPED', (event, title, body, icon, id) => {
    const notif = new Notification(title, {
      body: body,
      icon: icon
    });
    notif.addEventListener('click', e => {
      ipcRenderer.send('NOTIFICATION_CLICK', id);
    });
    //These events occur when a Notification is closed.
    notif.addEventListener('close', e => {
      ipcRenderer.send('NOTIFICATION_CLOSE', id);
    });
  });
})();