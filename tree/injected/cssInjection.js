window._fs = require("fs");
window._fileWatcher = null;
window._styleTag = null;
window.setupCSS = function(path) {
  var customCSS = window._fs.readFileSync(path, "utf-8");
  if(window._styleTag === null) {
    window._styleTag = document.createElement("style");
    document.head.appendChild(window._styleTag);
  }
  window._styleTag.innerHTML = customCSS;
  if(window._fileWatcher === null) {
    window._fileWatcher = window._fs.watch(path, { encoding: "utf-8" },
      function(eventType, filename) {
        if(eventType === "change") {
          var changed = window._fs.readFileSync(path, "utf-8");
          window._styleTag.innerHTML = changed;
        }
      }
    );
  }
};
window.tearDownCSS = function() {
  if(window._styleTag !== null) { window._styleTag.innerHTML = ""; }
  if(window._fileWatcher !== null) { window._fileWatcher.close(); window._fileWatcher = null; }
};
window.applyAndWatchCSS = function(path) {
  window.tearDownCSS();
  window.setupCSS(path);
};
window.applyAndWatchCSS(window.hansenRoot + '\\css\\css.css');