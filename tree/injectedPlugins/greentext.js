'use strict';

/* global scope */

scope.exports = {
  onMessageTextLoaded(e) {
    Array.from(e.children).filter(e => e.className.indexOf('markup') > -1 && e.className.indexOf('hansenGreenText') == -1).forEach(e => {
      var tx = e.textContent;
      if(tx[0] == '>') {
        e.className += ' hansenGreenText';
      }
    });
  },
  css: `
    .markup.hansenGreenText{color:#709900!important;}
  `,
};