'use strict';

scope.exports = {
  name: 'custom-rpc',

  description: 'custom rich presence',

  version: '1.0.0',

  author: 'hansen',

  init() {
    var childProcess = require('child_process');
    var vlcProcess = null;
    var nppProcess = null;
    var lastTimeout = -1;

    function getProcesses() {
      return new Promise((resolve, reject) => {
        childProcess.exec('tasklist', (err, stdout, stderr) => {
          resolve(stdout.toLowerCase());
        });
      });
    }

    async function refresh() {
      const proc = await getProcesses();
      //console.log(proc);
      
      if (proc.includes('vlc.exe')) {
        if (!vlcProcess) {
          console.log('[custom-rpc] spawn vlc');
          vlcProcess = childProcess.spawn('C:/Users/Rafael/Documents/GitHub/TestProject/HSNXT.DiscordRPC.VLC/bin/Debug/net47/HSNXT.DiscordRPC.VLCa.exe');
          vlcProcess.unref();
        }
      } else if (vlcProcess) {
        console.log('[custom-rpc] killing vlc');
        vlcProcess.kill();
        vlcProcess = null;
      }
      
      if (proc.includes('notepad++.exe')) {
        if (!nppProcess) {
          console.log('[custom-rpc] spawn nppProcess');
          nppProcess = childProcess.spawn('C:/Users/Rafael/Documents/GitHub/TestProject/HSNXT.DiscordRPC.NotepadPlusPlus/bin/Debug/net47/HSNXT.DiscordRPC.NotepadPlusPlus.exe');
          nppProcess.unref();
        }
      } else if (nppProcess) {
        console.log('[custom-rpc] killing nppProcess');
        nppProcess.kill();
        nppProcess = null;
      }

      lastTimeout = setTimeout(refresh, 10e3);
    }

    function tidy() {
      if (vlcProcess) {
        vlcProcess.kill();
        vlcProcess = null;
      }
      if (nppProcess) {
        nppProcess.kill();
        nppProcess = null;
      }
    }

    refresh();

    window.addEventListener('unload', tidy);
    process.on('exit', tidy);
    require('electron').remote.app.on('before-quit', tidy);
    console.log('[custom-rpc] loaded');
  },
};
