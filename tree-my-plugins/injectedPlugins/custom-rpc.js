'use strict';

const request = Hansen.require('request-promise-any');

scope.exports = {
  name: 'custom-rpc',

  description: 'custom rich presence',

  version: '1.0.0',

  author: 'hansen',

  init() {
    /*
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
    */
   
    // TODO i have _no idea_ if this works or not
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    let rpc;
    
    function createRpc(clientId) {
      rpc = new (Hansen.rlocal('discordjs-RPC-mod').Client)({transport: 'ipc'});
      
      return new Promise((resolve, reject) => {
        rpc.on('ready', resolve);
        rpc.login(clientId).catch(reject);
      });
    }

    const STATE_NONE = 0;
    const STATE_VLC = 1;
    const STATE_NPP = 2;

    let state = STATE_NONE;
    
    updateActivity();
    
    function addSeconds(date, amount) {
      return new Date(date.getTime() + (amount * 1000));
    }
    
    async function updateVLCActivity() {
      const res = JSON.parse(await request('http://127.0.0.1:8080/requests/status.json', {
        'auth': {
          'user': '', // empty
          'pass': 'dumbo', // vlc webui password
          'sendImmediately': false
        }
      }));
      await tidyAndRecreateRpc(STATE_VLC, '374693731632152576');

      if (res.information && res.information.category && res.information.category.meta) {
        const meta = res.information.category.meta;
                
        await rpc.setActivity({
          details: meta.title,
          state: meta.artist ? 'by ' + meta.artist : meta.filename.replace(/\.[^/.]+$/, ''),
          
          largeImageText: 'VLC ' + res.version,
          largeImageKey: 'vlc_big',
          smallImageKey: res.state == 'playing' ? 'play' : res.state == 'paused' ? 'pause' : res.state == 'stopped' ? 'stop' : 'mosic',
          smallImageText: 'Album: ' + meta.album + (meta.year ? ' (' + meta.year + ')' : ''),
          
          startTimestamp: res.state == 'playing' ? addSeconds(new Date(), -res.time) : undefined,
          endTimestamp: res.state == 'playing' ? addSeconds(new Date(), res.length - res.time) : undefined,

          instance: false,
        });
      } else {
        await rpc.setActivity({
          state: 'Nothing playing',
          details: 'Idle',
          
          largeImageText: 'VLC ' + res.version,
          largeImageKey: 'vlc_big',
          smallImageKey: 'stopped',
          
          instance: false,
        });
      }
    }
    
    async function updateActivity() {
      while (true) {
        console.log('[rpc] tick! state:', state);
        await sleep(10e3);
        try {
          await updateVLCActivity();
          continue;
        } catch (e) {
          if (!e.message.startsWith('Error: connect ECONNREFUSED')) {
            console.error(e);
          }
          if (rpc) await clearRpc();
          // TODO
          // remove clear RPC right above
          // if (check for npp)
          //   await tidyAndRecreateRpc(STATE_NPP, /*npp client id*/);
        }
      }
    }
    
    async function clearRpc() {
      await rpc.clearActivity();
      await sleep(10e3);
      await rpc.destroy();
      rpc = null;
      state = STATE_NONE;
    }

    // return: true if need to recreate rpc, false otherwise. automatically clears if is present.
    async function tidyAndRecreateRpc(targetState, clientId) {
      if (state != targetState && state != STATE_NONE && rpc) {
        await clearRpc();
      }
      if (!rpc) {//state == STATE_NONE
        await createRpc(clientId);
      }
      state = targetState;
    }

    console.log('[vlc] loaded');
  },
};
'use strict';
