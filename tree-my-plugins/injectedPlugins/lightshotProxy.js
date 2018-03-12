'use strict';

const http = require('http');

const request = Hansen.require('request');
const multiparty = Hansen.require('multiparty');
const imgur = Hansen.require('imgur');
//const fs = Hansen.require('fs');

scope.exports = {
  name: 'lightshotProxy',

  description: 'Proxy for lightshot => imgur',

  version: '1.0.0',

  author: 'hansen',
  
  init() {
    try {
      imgur.setClientId('d8b88dd7493540b');

      http.createServer().on('request', (req, res) => {
        console.log(req.url);
        console.log(req.headers);
        console.log(req.method);
        
        res.writeHead(200);
        if (req.url.includes('/upload/')) {
          const form = new multiparty.Form();
       
          form.parse(req, (err, fields, files) => {
            if (err) {
              console.log('ERR', err);
              res.write(`<?xml version='1.0' encoding='UTF-8'?>\r\n<response><status>success</status><url>${err}</url><thumb>${err}</thumb></response>`);
              res.end();
              return;
            }
            const path = files.image[0].path;
            imgur.uploadFile(path)
              .then(json => {
                fs.unlink(path, () => {
                  const url = json.data.link;
                  res.write(`<?xml version='1.0' encoding='UTF-8'?>\r\n<response><status>success</status><url>${url}</url><thumb>${url}</thumb></response>`);
                  res.end();
                });
              })
              .catch(err => {
                fs.unlink(path, () => {
                  res.write(`<?xml version='1.0' encoding='UTF-8'?>\r\n<response><status>success</status><url>${err.message}</url><thumb>${err.message}</thumb></response>`);
                  res.end();
                });
              });
            
          });
        } else {
          res.end();
        }
      }).listen(5056);

      console.log('[lightshotProxy] loaded');
    } catch (e) {
      console.error('[lightshotProxy] failed with', e);
    }
  },
};