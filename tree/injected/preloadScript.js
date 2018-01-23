(() => {
  console.log('[preload-script] hi!');
  
  /*
   * Intercepts the localStorage variable before it is deleted.
   * https://github.com/DiscordInjections/DiscordInjections/blob/389da07bffe0427647b3c1d1a0be9e9999ba546f/Preload/LocalStorageInterceptor.js
   */

  let localStorage = window._localStorage = window.localStorage;

  localStorage.constructor.prototype._setItem = localStorage.constructor.prototype.setItem;
  localStorage.constructor.prototype.setItem = (...args) => {
    try {
      if (localStorage.getItem(args[0]) != args[1]) {
        let lastModified = localStorage.getItem('DI-LastModified');
        if (!lastModified) lastModified = {};
        else lastModified = JSON.parse(lastModified);
        lastModified[args[0]] = Date.now();
        localStorage._setItem('DI-LastModified', JSON.stringify(lastModified));
      }
    } catch (err) {
      console.error('[preload-script] error in localStorage.setItem', err);
    }
    localStorage._setItem(...args);
  };
  
  /*
   * Event: 'loaded'
   * 
   * Emitted when Electron has loaded its internal initialization script and is beginning to load the web page or the main script.
   * 
   * It can be used by the preload script to add removed Node global symbols back to the global scope when node integration is turned off.
   */
  process.once('loaded', () => {
    try {
      window.__sockets = [];
      class HackSocket extends WebSocket {
        constructor(...args) {
          super(...args);
          window.__sockets.push({
            t: this,
            args: args
          });
        }
      }
      WebSocket = HackSocket;
      console.log('[preload-script] prepared socket');

      //if (window.skap) document.removeEventListener('keydown', window.skap);
      window.__key_down_hooks = [];
      window.__key_press_hooks = [];
      document.addEventListener('keydown', e => {
        for (let hook of window.__key_down_hooks) {
          hook(e);
        }
      }, true);
      document.addEventListener('keypress', e => {
        for (let hook of window.__key_press_hooks) {
          hook(e);
        }
      }, true);
      
      console.log('[preload-script] prepared!');
    } catch (err) {
      console.error('[preload-script] error on load', err);
    }
  });
  /*
function getReactInstance(node) {
  return node[Object.keys(node).find((key) => key.startsWith('__reactInternalInstance'))];
};
window.__key_down_hooks[0] = e => {
  const txta = document.getElementsByTagName('textarea')[0];
  const kcode = String.fromCharCode(e.char || e.charCode || e.keyCode || e.which);
  const value = txta.value + kcode;
  if (value.startsWith('/beep') && e.which == 13) {
    console.log('got it!', e);
    const ri = getReactInstance(txta);
    const ri2 = ri.return.memoizedProps;
    txta.value = ri2.value = ri.memoizedProps.value = 'boop';
    e.preventDefault();
    ri.memoizedProps.onChange({target: txta});
    ri.memoizedProps.onKeyPress({which: 13,preventDefault: (...args) => console.log(...args, new Error())});
  }
};
  */
})();