'use strict';

/* global scope, fs*/

scope.exports = {
  init() {
    var ud = rootPath + 'injectedUserData';
    fs.readdir(ud + '/highlight-js-themes', (err, files) => {
      if (err) {
        console.error(err);
        return;
      }
      
      window._styles = files.map(e => e.substring(0, e.lastIndexOf('.')));
      window._switchStyle = style => {
        fs.writeFileSync(ud + '/currentHighlightTheme.txt', style);
        // TODO
      };
      
      if (fs.existsSync(ud + '/currentHighlightTheme.txt')) {
        window._switchStyle(fs.readFileSync(ud + '/currentHighlightTheme.txt', 'utf8').trim());
      }
    });
  },

  name: 'Style Switcher',

  description: 'Highlight.js theme switcher',

  version: '1.0.0',

  author: 'hansen',
};