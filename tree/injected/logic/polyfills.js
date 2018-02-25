'use strict';
// used by bd plugin event listeners
// https://github.com/Jiiks/BetterDiscordApp/blob/master/js/main.js#L2966-L3065
// https://github.com/rauenzi/BetterDiscordApp/blob/28174e59c9fb4ce9d747760b5b618c52d112c897/js/main.js#L1351-L1414
window.bdplugins = {};
window.pluginCookie = {};

module.exports.load = storageData => {
  window.BdApi = {
    _entries: [],
    getPlugin(name) {
      return window.BdApi._entries.find(e => e.name == name)._pluginHolder;
    },
    injectCSS(name, text) {
      const style = document.createElement('style');

      style.id = '__pluginStyles_' + name;
      style.type = 'text/css';
      style.appendChild(document.createTextNode(text));

      document.head.appendChild(style);
    },
    clearCSS(name) {
      const elem = document.getElementById('__pluginStyles_' + name);
      if (elem) elem.parentNode.removeChild(elem);
    },
    // Edited version of getReactInstance by noodlebox/samogot
    getReactInstance(node) {
      if (!(node instanceof jQuery) && !(node instanceof Element)) return undefined;
      var domNode = node instanceof jQuery ? node[0] : node;
      return domNode[Object.keys(domNode).find(key => key.startsWith('__reactInternalInstance'))];
    },
    getReactProperty(node, path) {
      var value = path.split(/\s?\.\s?/).reduce(function(obj, prop) {
        return obj && obj[prop];
      }, window.BdApi.getReactInstance(node));
      return value;
    }
  };
  // bd storage polyfill (this needs to be on 'window', can't be a function arg)
  window.bdPluginStorage = {
    get: function(plugin, key) {
      return (storageData.bd && storageData.bd[plugin]) ? storageData.bd[plugin][key] : null;
    },
    set: function(plugin, key, value) {
      if (!storageData.bd) {
        storageData.bd = {};
      }
      if (!storageData.bd[plugin]) {
        storageData.bd[plugin] = {};
      }
      var stored = storageData.bd[plugin][key];
      storageData.bd[plugin][key] = value;
      return stored;
    },
    delete(plugin, key) {
      if (storageData.bd && storageData.bd[plugin]) {
        delete storageData.bd[plugin][key];
      }
    },
  };
};