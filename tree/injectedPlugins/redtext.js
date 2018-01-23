'use strict';

/* global scope */

scope.exports = {
  onMessageTextLoaded(e) {
    Array.from(e.children).filter(e => e.className.indexOf('markup') > -1 && e.className.indexOf('hansenOrangeText') == -1).forEach(e => {
      var tx = e.textContent;
      if(tx[tx.length-1] == '<') {
        e.className += ' hansenOrangeText';
      }
    });
  },
  css: `
    .markup.hansenOrangeText{color:#FB910A!important;}
  `,
};