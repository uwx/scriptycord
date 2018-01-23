'use strict';

scope.exports = {
  name: 'devtronLoader',

  description: 'Injects Devtron.',

  version: '1.0.0',

  author: 'hansen',
  
  init() {
    try {
      global.__require('devtron').install();
      console.log('[devtronLoader] loaded');
    } catch (e) {
      console.error('[devtronLoader] failed with', e);
    }
  },
};