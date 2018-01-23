'use strict';

/* global rootPath, fs, log, error*/

var https = require('https');

function download(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
}

function aself() {
  if (fs.existsSync(rootPath + 'injectedUserData\\jQuery.js')) {
    log('loading jQuery');
    var module = {
      exports: {},
    };
    eval(fs.readFileSync(rootPath + 'injectedUserData\\jQuery.js', 'utf8'));
    if (!window.$ || !window.jQuery) {
      window.jQuery = window.$ =  module.exports;
    }
    log('done loading jQuery');
  } else {
    log('downloading jQuery');
    download('https://code.jquery.com/jquery-3.2.1.min.js', rootPath + 'injectedUserData\\jQuery.js', err => {
      if (err) {
        error('could not download jQuery', err);
      }
      log('done downloading jQuery');
      aself();
    });
  }
}

aself();